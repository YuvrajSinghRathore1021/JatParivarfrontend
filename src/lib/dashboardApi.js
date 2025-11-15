// frontend/src/lib/dashboardApi.js
import { get, post, put, patch } from './api'

// Matrimony
export const fetchMatrimonyProfiles = (sort = 'recent') =>
  get(`/matrimony/profiles?sort=${encodeURIComponent(sort)}`)

export const fetchMyMatrimonyProfile = () => get('/matrimony/profiles/me')

export const saveMatrimonyProfile = (payload) => post('/matrimony/profiles', payload)
export const saveMatrimony = (payload) => post('/admin/matrimony/save', payload)

export const sendMatrimonyInterest = (userId) => post(`/matrimony/interest/${userId}`, {})

export const fetchMatrimonyInterests = () => get('/matrimony/interests')

export const acceptMatrimonyInterest = (interestId) => post(`/matrimony/interest/${interestId}/accept`, {})

// Jobs
export const fetchJobs = () => get('/jobs')

export const fetchMyJobs = () => get('/jobs/mine')

export const fetchJobDetail = (jobId) => get(`/jobs/${jobId}`)

export const createJobPost = (payload) => post('/jobs', payload)

export const updateJobPost = (jobId, payload) => patch(`/jobs/${jobId}`, payload)

export const applyToJob = (jobId, payload) => post(`/jobs/${jobId}/applications`, payload)

export const fetchJobApplicants = (jobId) => get(`/jobs/${jobId}/applications`)

// Institutions
export const fetchInstitutions = (kind) =>
  get(`/institutions${kind ? `?kind=${encodeURIComponent(kind)}` : ''}`)

export const fetchMyInstitutions = () => get('/institutions/mine')

export const createInstitution = (payload) => post('/institutions', payload)

export const updateInstitution = (id, payload) => patch(`/institutions/${id}`, payload)

// Profile
export const fetchMyProfile = () => get('/me/profile')

export const updateMyProfile = (payload) => put('/me/profile', payload)

export const updateMyAvatar = (payload) => put('/me/profile/avatar', payload)

export const updateMyPassword = (payload) => put('/me/profile/password', payload)
