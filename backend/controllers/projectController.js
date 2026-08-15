const Project = require('../models/Project');
const { PROJECT_STATUS } = require('../constants');

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { projectName, roadName, description, location, contractorId, totalBudget, startDate, expectedCompletionDate } = req.body;
    if (!projectName || !totalBudget) {
      return res.status(400).json({ success: false, message: 'Project name and budget are required' });
    }
    const project = await Project.create({
      projectName, roadName, description, location, contractorId,
      totalBudget: parseFloat(totalBudget),
      startDate, expectedCompletionDate,
      createdBy: req.user._id,
      status: PROJECT_STATUS.ACTIVE
    });
    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('contractorId', 'firmName contractorNumber')
      .sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('contractorId', 'firmName contractorNumber');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id/budget
const getProjectBudget = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('contractorId', 'firmName');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const eligibleRelease = project.retainedAmount * 0.5; // example: 50% eligible after completion
    res.json({
      success: true,
      budget: {
        totalBudget: project.totalBudget,
        constructionAllocation: project.constructionAllocation,
        retainedAmount: project.retainedAmount,
        releasedRetainedAmount: project.releasedRetainedAmount,
        remainingRetained: project.retainedAmount - project.releasedRetainedAmount,
        eligibleRetainedRelease: eligibleRelease
      }
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/projects/:id/budget
const updateProjectBudget = async (req, res, next) => {
  try {
    const { releasedRetainedAmount } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (releasedRetainedAmount > project.retainedAmount) {
      return res.status(400).json({ success: false, message: 'Released amount cannot exceed retained amount' });
    }
    project.releasedRetainedAmount = releasedRetainedAmount;
    await project.save();
    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getAllProjects, getProjectById, getProjectBudget, updateProjectBudget };
