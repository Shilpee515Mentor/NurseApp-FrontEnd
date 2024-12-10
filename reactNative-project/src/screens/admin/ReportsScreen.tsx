import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  SegmentedButtons,
  Button,
  Menu,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { format, subDays } from 'date-fns';

const { width } = Dimensions.get('window');

interface ReportData {
  requestsByDepartment: {
    department: string;
    count: number;
    color: string;
  }[];
  requestsByStatus: {
    status: string;
    count: number;
  }[];
  requestsTrend: {
    date: string;
    count: number;
  }[];
  nursePerformance: {
    name: string;
    completedRequests: number;
    averageResponseTime: number;
  }[];
}

export default function ReportsScreen() {
  const [timeRange, setTimeRange] = useState('week');
  const [reportType, setReportType] = useState('requests');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const theme = useTheme();

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    // Mock data - replace with actual API call
    const mockData: ReportData = {
      requestsByDepartment: [
        { department: 'Cardiology', count: 45, color: '#FF6384' },
        { department: 'Neurology', count: 28, color: '#36A2EB' },
        { department: 'Pediatrics', count: 32, color: '#FFCE56' },
        { department: 'Oncology', count: 22, color: '#4BC0C0' },
      ],
      requestsByStatus: [
        { status: 'Completed', count: 85 },
        { status: 'In Progress', count: 45 },
        { status: 'Pending', count: 32 },
      ],
      requestsTrend: Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), i), 'MM/dd'),
        count: Math.floor(Math.random() * 50) + 20,
      })).reverse(),
      nursePerformance: [
        { name: 'John Doe', completedRequests: 45, averageResponseTime: 12 },
        { name: 'Jane Smith', completedRequests: 38, averageResponseTime: 15 },
        { name: 'Mike Johnson', completedRequests: 42, averageResponseTime: 10 },
      ],
    };
    setReportData(mockData);
  };

  const renderChart = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'requests':
        return (
          <Surface style={styles.chartCard}>
            <Text style={styles.chartTitle}>Requests Trend</Text>
            <LineChart
              data={{
                labels: reportData.requestsTrend.map(item => item.date),
                datasets: [{
                  data: reportData.requestsTrend.map(item => item.count),
                }],
              }}
              width={width - 64}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(106, 17, 203, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </Surface>
        );

      case 'departments':
        return (
          <Surface style={styles.chartCard}>
            <Text style={styles.chartTitle}>Requests by Department</Text>
            <PieChart
              data={reportData.requestsByDepartment.map(item => ({
                name: item.department,
                population: item.count,
                color: item.color,
                legendFontColor: '#7F7F7F',
                legendFontSize: 12,
              }))}
              width={width - 64}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </Surface>
        );

      case 'performance':
        return (
          <Surface style={styles.chartCard}>
            <Text style={styles.chartTitle}>Nurse Performance</Text>
            <BarChart
              data={{
                labels: reportData.nursePerformance.map(item => item.name.split(' ')[0]),
                datasets: [{
                  data: reportData.nursePerformance.map(item => item.completedRequests),
                }],
              }}
              width={width - 64}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: theme.colors.surface,
                backgroundGradientFrom: theme.colors.surface,
                backgroundGradientTo: theme.colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 117, 252, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={styles.chart}
            />
          </Surface>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#6A11CB', '#2575FC'] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Reports</Text>
            <Menu
              visible={showExportMenu}
              onDismiss={() => setShowExportMenu(false)}
              anchor={
                <IconButton
                  icon="export-variant"
                  iconColor="#fff"
                  size={24}
                  onPress={() => setShowExportMenu(true)}
                  style={styles.headerButton}
                />
              }
            >
              <Menu.Item onPress={() => {}} title="Export as PDF" />
              <Menu.Item onPress={() => {}} title="Export as CSV" />
              <Menu.Item onPress={() => {}} title="Share Report" />
            </Menu>
          </View>

          <View style={styles.filterContainer}>
            <SegmentedButtons
              value={timeRange}
              onValueChange={setTimeRange}
              buttons={[
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
              style={styles.timeRangeSelector}
            />
          </View>
        </BlurView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown}>
          <View style={styles.reportTypeContainer}>
            <Button
              mode={reportType === 'requests' ? 'contained' : 'outlined'}
              onPress={() => setReportType('requests')}
              icon="chart-line"
              style={styles.reportTypeButton}
            >
              Requests
            </Button>
            <Button
              mode={reportType === 'departments' ? 'contained' : 'outlined'}
              onPress={() => setReportType('departments')}
              icon="chart-pie"
              style={styles.reportTypeButton}
            >
              Departments
            </Button>
            <Button
              mode={reportType === 'performance' ? 'contained' : 'outlined'}
              onPress={() => setReportType('performance')}
              icon="chart-bar"
              style={styles.reportTypeButton}
            >
              Performance
            </Button>
          </View>

          {renderChart()}

          <Surface style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Key Metrics</Text>
            <Divider style={styles.divider} />
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Icon name="clipboard-check" size={24} color={theme.colors.primary} />
                <Text style={styles.metricValue}>162</Text>
                <Text style={styles.metricLabel}>Total Requests</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="clock-check" size={24} color="#4CAF50" />
                <Text style={styles.metricValue}>85%</Text>
                <Text style={styles.metricLabel}>Completion Rate</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="clock" size={24} color="#FF9800" />
                <Text style={styles.metricValue}>12.5m</Text>
                <Text style={styles.metricLabel}>Avg Response</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="account-group" size={24} color="#2196F3" />
                <Text style={styles.metricValue}>24</Text>
                <Text style={styles.metricLabel}>Active Nurses</Text>
              </View>
            </View>
          </Surface>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerBlur: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  filterContainer: {
    marginBottom: 8,
  },
  timeRangeSelector: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reportTypeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
}); 