import { Request, Response } from 'express';
import { Request as PatientRequest } from '../models/Request';
import { RequestStatus, RequestPriority, NursingDepartment } from '../types';

export const createRequest = async (req: Request, res: Response) => {
  try {
    const { description, priority, department, room, patient, nurse } = req.body;

    // Validate that department is a valid enum value
    if (!Object.values(NursingDepartment).includes(department)) {
      return res.status(400).json({ 
        errors: [{ msg: 'Invalid department', param: 'department' }] 
      });
    }

    const request = await PatientRequest.create({
      patient,
      nurse,
      priority,
      description,
      department,
      room,
      status: RequestStatus.PENDING
    });

    // Populate patient and nurse details
    await request.populate(['patient', 'nurse']);

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Error creating request' });
  }
};

export const getRequests = async (req: Request, res: Response) => {
  try {
    const { status, priority, department } = req.query;

    // Build query based on filters
    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (department) query.department = department;

    const requests = await PatientRequest.find(query)
      .populate(['patient', 'nurse'])
      .sort({ createdAt: -1 });

    res.json({
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

export const updateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, nurse } = req.body;

    const request = await PatientRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (status) request.status = status;
    if (nurse) request.nurse = nurse;

    await request.save();

    // Emit socket event
    req.app.get('io').to(`department:${request.department}`).emit('requestUpdate', {
      type: 'update',
      request
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating request', error });
  }
};

import { User } from '../models/User';

export const getNursePatients = async (req: Request, res: Response) => {
  try {
    // Get all requests assigned to this nurse
    const requests = await PatientRequest.find({ nurse: req.user?._id })
      .populate('patient')
      .sort({ createdAt: -1 });

    // Group requests by patient
    const patientMap = new Map();
    requests.forEach(request => {
      if (!patientMap.has(request.patient._id.toString())) {
        patientMap.set(request.patient._id.toString(), {
          patient: request.patient,
          requests: []
        });
      }
      patientMap.get(request.patient._id.toString()).requests.push(request);
    });

    // Convert map to array
    const patientsData = Array.from(patientMap.values());

    res.json(patientsData);
  } catch (error) {
    console.error('Error fetching nurse patients:', error);
    res.status(500).json({ message: 'Error fetching patients data' });
  }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!Object.values(RequestStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find request and check if nurse is assigned
    const request = await PatientRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.nurse?.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    // Update status
    request.status = status;
    await request.save();

    res.json({ message: 'Request status updated successfully', request });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Error updating request status' });
  }
};