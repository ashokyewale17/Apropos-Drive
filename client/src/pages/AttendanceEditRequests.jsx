import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, User, Calendar, Edit3, 
  Check, X, RefreshCw, Search, Filter
} from 'lucide-react';
import { format } from 'date-fns';

const AttendanceEditRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEditRequests();
  }, [filter]);

  const loadEditRequests = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the backend
      // For now, we'll use mock data
      const mockRequests = [
        {
          id: 1,
          employeeId: 2,
          employeeName: 'Vijay Solanki',
          employeeEmail: 'vijay.solanki@company.com',
          attendanceId: 101,
          date: new Date(2025, 9, 5),
          originalInTime: '09:00',
          originalOutTime: '17:30',
          requestedInTime: '08:45',
          requestedOutTime: '17:45',
          reason: 'Actually arrived early and stayed late to finish project',
          status: 'pending',
          requestedAt: new Date(2025, 9, 6, 10, 30)
        },
        {
          id: 2,
          employeeId: 4,
          employeeName: 'Sanket Pawal',
          employeeEmail: 'sanket.pawal@company.com',
          attendanceId: 102,
          date: new Date(2025, 9, 4),
          originalInTime: '09:15',
          originalOutTime: '17:45',
          requestedInTime: '09:00',
          requestedOutTime: '18:00',
          reason: 'Team meeting started early, had to adjust timing',
          status: 'pending',
          requestedAt: new Date(2025, 9, 5, 14, 20)
        },
        {
          id: 3,
          employeeId: 5,
          employeeName: 'Ashok Yewale',
          employeeEmail: 'ashok.yewale@company.com',
          attendanceId: 103,
          date: new Date(2025, 9, 3),
          originalInTime: '08:15',
          originalOutTime: '16:30',
          requestedInTime: '08:15',
          requestedOutTime: '17:00',
          reason: 'Worked extra hour to complete client deliverables',
          status: 'approved',
          requestedAt: new Date(2025, 9, 4, 9, 15),
          reviewedAt: new Date(2025, 9, 4, 11, 30),
          reviewedBy: 'Tushar Mhaskar'
        },
        {
          id: 4,
          employeeId: 7,
          employeeName: 'Prasanna Pandit',
          employeeEmail: 'prasanna.pandit@company.com',
          attendanceId: 104,
          date: new Date(2025, 9, 2),
          originalInTime: '10:30',
          originalOutTime: '18:30',
          requestedInTime: '09:00',
          requestedOutTime: '18:30',
          reason: 'Misrecorded arrival time, actually came in earlier',
          status: 'rejected',
          requestedAt: new Date(2025, 9, 3, 16, 45),
          reviewedAt: new Date(2025, 9, 3, 18, 20),
          reviewedBy: 'Tushar Mhaskar',
          rejectionReason: 'Insufficient evidence provided'
        }
      ];

      // Filter based on status
      const filteredRequests = filter === 'all' 
        ? mockRequests 
        : mockRequests.filter(req => req.status === filter);

      // Filter based on search term
      const searchedRequests = filteredRequests.filter(req => 
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setRequests(searchedRequests);
    } catch (error) {
      console.error('Error loading edit requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    // In a real implementation, this would send a request to the backend
    console.log(`Approving request ${requestId}`);
    alert(`Request ${requestId} approved successfully!`);
    loadEditRequests(); // Refresh the list
  };

  const handleReject = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      // In a real implementation, this would send a request to the backend
      console.log(`Rejecting request ${requestId} with reason: ${reason}`);
      alert(`Request ${requestId} rejected successfully!`);
      loadEditRequests(); // Refresh the list
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span style={{ 
          padding: '0.25rem 0.75rem', 
          borderRadius: '1rem', 
          fontSize: '0.75rem', 
          fontWeight: '500',
          background: '#fef3c7',
          color: '#92400e'
        }}>Pending</span>;
      case 'approved':
        return <span style={{ 
          padding: '0.25rem 0.75rem', 
          borderRadius: '1rem', 
          fontSize: '0.75rem', 
          fontWeight: '500',
          background: '#d1fae5',
          color: '#065f46'
        }}>Approved</span>;
      case 'rejected':
        return <span style={{ 
          padding: '0.25rem 0.75rem', 
          borderRadius: '1rem', 
          fontSize: '0.75rem', 
          fontWeight: '500',
          background: '#fee2e2',
          color: '#991b1b'
        }}>Rejected</span>;
      default:
        return <span style={{ 
          padding: '0.25rem 0.75rem', 
          borderRadius: '1rem', 
          fontSize: '0.75rem', 
          fontWeight: '500',
          background: '#f3f4f6',
          color: '#6b7280'
        }}>Unknown</span>;
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  return (
    <div style={{ padding: '1.5rem', background: 'var(--background-alt)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                📝 Attendance Edit Requests
              </h1>
              <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                Review and approve employee attendance timing changes
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {requests.filter(r => r.status === 'pending').length}
              </div>
              <p style={{ fontSize: '1rem', opacity: 0.8 }}>
                Pending Requests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ marginBottom: '2rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '200px' }}>
              <Search size={16} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  width: '100%'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  background: filter === 'all' ? 'var(--primary-color)' : 'white',
                  color: filter === 'all' ? 'white' : 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                All Requests
              </button>
              <button
                onClick={() => setFilter('pending')}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  background: filter === 'pending' ? '#f59e0b' : 'white',
                  color: filter === 'pending' ? 'white' : 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('approved')}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  background: filter === 'approved' ? '#10b981' : 'white',
                  color: filter === 'approved' ? 'white' : 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter('rejected')}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  background: filter === 'rejected' ? '#ef4444' : 'white',
                  color: filter === 'rejected' ? 'white' : 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Rejected
              </button>
            </div>
            
            <button
              onClick={loadEditRequests}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--primary-color)',
                borderRadius: '0.5rem',
                background: 'var(--primary-color)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="card" style={{ border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={20} />
            Attendance Edit Requests
          </h3>
        </div>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                Loading attendance edit requests...
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <Edit3 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No attendance edit requests found</p>
              <p style={{ fontSize: '0.875rem' }}>
                {filter === 'pending' 
                  ? 'There are no pending requests at this time.' 
                  : filter === 'approved' 
                    ? 'No approved requests found.' 
                    : filter === 'rejected' 
                      ? 'No rejected requests found.' 
                      : 'No requests match your search criteria.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredRequests.map((request) => (
                <div key={request.id} style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  background: 'white',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-color), #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}>
                        {request.employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                          {request.employeeName}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          {request.employeeEmail}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} />
                          {format(request.date, 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      {getStatusBadge(request.status)}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Requested: {format(request.requestedAt, 'MMM dd, yyyy HH:mm')}
                      </div>
                      {request.reviewedAt && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Reviewed: {format(request.reviewedAt, 'MMM dd, yyyy HH:mm')} by {request.reviewedBy}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ padding: '1rem', background: 'var(--background-alt)', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Original Timing
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Check In</div>
                          <div style={{ fontWeight: '600' }}>{request.originalInTime || '-'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Check Out</div>
                          <div style={{ fontWeight: '600' }}>{request.originalOutTime || '-'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '0.5rem' }}>
                      <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem' }}>
                        Requested Timing
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>Check In</div>
                          <div style={{ fontWeight: '600', color: '#1e40af' }}>{request.requestedInTime || '-'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>Check Out</div>
                          <div style={{ fontWeight: '600', color: '#1e40af' }}>{request.requestedOutTime || '-'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={16} />
                      Reason for Edit
                    </div>
                    <div style={{ 
                      padding: '1rem', 
                      background: 'var(--background-alt)', 
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      {request.reason}
                    </div>
                  </div>
                  
                  {request.status === 'rejected' && request.rejectionReason && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <XCircle size={16} color="#ef4444" />
                        Rejection Reason
                      </div>
                      <div style={{ 
                        padding: '1rem', 
                        background: '#fee2e2', 
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#991b1b'
                      }}>
                        {request.rejectionReason}
                      </div>
                    </div>
                  )}
                  
                  {request.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleReject(request.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #ef4444',
                          borderRadius: '0.375rem',
                          background: 'white',
                          color: '#ef4444',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <X size={16} />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          border: 'none',
                          borderRadius: '0.375rem',
                          background: '#10b981',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Check size={16} />
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceEditRequests;