import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { 
  Calendar, Clock, TrendingUp, Download, Filter, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, AlertCircle, BarChart3, Timer, Coffee, X, Eye, Edit, Save, AlertTriangle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWeekend } from 'date-fns';

const EmployeeAttendance = () => {
  const { user, addNotification } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [filteredDays, setFilteredDays] = useState([]);
  const [editingDay, setEditingDay] = useState(null);
  const [editData, setEditData] = useState({ inTime: '', outTime: '', reason: '' });
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    loadAttendanceData();
    loadPendingRequests();
  }, [currentMonth]);

  const loadAttendanceData = () => {
    setLoading(true);
    
    // Generate mock attendance data for the current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const mockData = monthDays.map(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const storageKey = `checkIn_${user.id}_${dayKey}`;
      const savedData = localStorage.getItem(storageKey);
      
      // Skip weekends for mock data
      if (isWeekend(day)) {
        return {
          date: day,
          status: 'weekend',
          checkIn: null,
          checkOut: null,
          totalHours: 0,
          breaks: 0,
          notes: 'Weekend'
        };
      }
      
      if (savedData) {
        const data = JSON.parse(savedData);
        return {
          date: day,
          status: data.checkedIn ? 'active' : (data.totalTime ? 'completed' : 'absent'),
          checkIn: data.checkInTime ? new Date(data.checkInTime) : null,
          checkOut: data.checkOutTime ? new Date(data.checkOutTime) : null,
          totalHours: data.totalTime || '0h 0m',
          breaks: data.activities ? data.activities.filter(a => a.type === 'break').length : 0,
          notes: data.notes || ''
        };
      }
      
      // Generate some mock data for demonstration
      const isToday = isSameDay(day, new Date());
      const isPast = day < new Date();
      
      if (isToday) {
        return {
          date: day,
          status: 'active',
          checkIn: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          checkOut: null,
          totalHours: '8h 0m',
          breaks: 1,
          notes: 'Currently working'
        };
      } else if (isPast && Math.random() > 0.2) {
        const checkInHour = Math.floor(Math.random() * 3) + 8; // 8-10 AM
        const checkOutHour = Math.floor(Math.random() * 3) + 17; // 5-7 PM
        const checkIn = new Date(day);
        checkIn.setHours(checkInHour, Math.floor(Math.random() * 60), 0);
        const checkOut = new Date(day);
        checkOut.setHours(checkOutHour, Math.floor(Math.random() * 60), 0);
        
        const totalMinutes = (checkOut - checkIn) / (1000 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        
        return {
          date: day,
          status: 'completed',
          checkIn,
          checkOut,
          totalHours: `${hours}h ${minutes}m`,
          breaks: Math.floor(Math.random() * 3),
          notes: Math.random() > 0.8 ? 'Late arrival' : ''
        };
      }
      
      return {
        date: day,
        status: 'absent',
        checkIn: null,
        checkOut: null,
        totalHours: '0h 0m',
        breaks: 0,
        notes: Math.random() > 0.7 ? 'Sick leave' : 'Absent'
      };
    });
    
    setAttendanceData(mockData);
    calculateMonthlyStats(mockData);
    setLoading(false);
  };

  const loadPendingRequests = async () => {
    // In a real implementation, this would fetch from the backend
    // For now, we'll use mock data
    const mockRequests = [
      {
        id: 1,
        date: new Date(2025, 9, 5),
        status: 'pending',
        reason: 'Incorrect check-in time'
      }
    ];
    setPendingRequests(mockRequests);
  };

  const calculateMonthlyStats = (data) => {
    const totalDays = data.length;
    const workingDays = data.filter(d => !isWeekend(d.date)).length;
    const presentDays = data.filter(d => d.status === 'completed' || d.status === 'active').length;
    const absentDays = data.filter(d => d.status === 'absent').length;
    const lateDays = data.filter(d => d.notes === 'Late arrival').length;
    
    const totalHours = data.reduce((total, day) => {
      if (day.totalHours && day.totalHours !== '0h 0m') {
        const [hours, minutes] = day.totalHours.split('h ');
        return total + parseInt(hours) + (parseInt(minutes) / 60);
      }
      return total;
    }, 0);
    
    setMonthlyStats({
      totalDays,
      workingDays,
      presentDays,
      absentDays,
      lateDays,
      totalHours: `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m`,
      attendanceRate: workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'active': return '#3b82f6';
      case 'absent': return '#ef4444';
      case 'weekend': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'active': return <Clock size={16} />;
      case 'absent': return <XCircle size={16} />;
      case 'weekend': return <Coffee size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const exportAttendance = () => {
    const csvContent = [
      ['Date', 'Status', 'Check In', 'Check Out', 'Total Hours', 'Breaks', 'Notes'],
      ...attendanceData.map(day => [
        format(day.date, 'yyyy-MM-dd'),
        day.status,
        day.checkIn ? format(day.checkIn, 'HH:mm') : '',
        day.checkOut ? format(day.checkOut, 'HH:mm') : '',
        day.totalHours,
        day.breaks,
        day.notes
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(currentMonth, 'yyyy-MM')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const handleCardClick = (type) => {
    let filtered = [];
    let title = '';
    
    switch (type) {
      case 'present':
        filtered = attendanceData.filter(d => d.status === 'completed' || d.status === 'active');
        title = 'Present Days';
        break;
      case 'absent':
        filtered = attendanceData.filter(d => d.status === 'absent');
        title = 'Absent Days';
        break;
      case 'late':
        filtered = attendanceData.filter(d => d.notes === 'Late arrival');
        title = 'Late Days';
        break;
      default:
        return;
    }
    
    setFilteredDays(filtered);
    setModalType(title);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setFilteredDays([]);
    setModalType('');
  };

  const startEditing = (day) => {
    setEditingDay(day);
    setEditData({
      inTime: day.checkIn ? format(day.checkIn, 'HH:mm') : '',
      outTime: day.checkOut ? format(day.checkOut, 'HH:mm') : '',
      reason: ''
    });
  };

  const cancelEditing = () => {
    setEditingDay(null);
    setEditData({ inTime: '', outTime: '', reason: '' });
  };

  const saveEdit = async () => {
    // In a real implementation, this would send the data to the backend
    console.log('Saving edit for day:', editingDay, 'with data:', editData);
    
    // Show success notification
    addNotification({
      title: 'Attendance Edit Request Submitted',
      message: 'Your attendance edit request has been submitted for admin approval.',
      type: 'success'
    });
    
    // For now, we'll just show a success message
    alert('Edit request submitted successfully! It will be reviewed by admin.');
    cancelEditing();
  };

  const isDayEditable = (day) => {
    // Only allow editing for past days that have attendance data
    return day.status === 'completed' && day.date < new Date();
  };

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
                📅 My Attendance
              </h1>
              <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                Track your daily attendance and working hours
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {monthlyStats.attendanceRate || 0}%
              </div>
              <p style={{ fontSize: '1rem', opacity: 0.8 }}>
                Attendance Rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests Banner */}
      {pendingRequests.length > 0 && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <AlertTriangle size={24} color="#856404" />
          <div>
            <div style={{ fontWeight: '600', color: '#856404' }}>
              You have {pendingRequests.length} pending attendance edit request(s)
            </div>
            <div style={{ fontSize: '0.875rem', color: '#856404' }}>
              These requests are awaiting admin approval
            </div>
          </div>
        </div>
      )}

      {/* Monthly Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div 
          onClick={() => handleCardClick('present')}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '1rem',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px) scale(1.02)';
            e.target.style.boxShadow = '0 15px 30px rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <CheckCircle size={24} />
              {monthlyStats.presentDays || 0}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>Present Days</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Eye size={12} />
              Click to view details
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
        </div>
        
        <div 
          onClick={() => handleCardClick('absent')}
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '1rem',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px) scale(1.02)';
            e.target.style.boxShadow = '0 15px 30px rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <XCircle size={24} />
              {monthlyStats.absentDays || 0}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>Absent Days</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Eye size={12} />
              Click to view details
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
        </div>
        
        <div 
          onClick={() => handleCardClick('late')}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '1rem',
            padding: '1.5rem',
            color: 'white',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px) scale(1.02)';
            e.target.style.boxShadow = '0 15px 30px rgba(245, 158, 11, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <AlertCircle size={24} />
              {monthlyStats.lateDays || 0}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>Late Days</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Eye size={12} />
              Click to view details
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {monthlyStats.totalHours || '0h 0m'}
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Total Hours</div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="card" style={{ marginBottom: '2rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigateMonth('prev')}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--primary-color)',
                  borderRadius: '0.5rem',
                  background: 'var(--primary-color)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--primary-color)';
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                style={{
                  padding: '0.5rem',
                  border: '1px solid var(--primary-color)',
                  borderRadius: '0.5rem',
                  background: 'var(--primary-color)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--primary-color)';
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCurrentMonth(new Date())}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--primary-color)',
                  borderRadius: '0.5rem',
                  background: 'white',
                  color: 'var(--primary-color)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Current Month
              </button>
              <button
                onClick={exportAttendance}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
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
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Calendar */}
      <div className="card" style={{ border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} />
            Daily Attendance
          </h3>
        </div>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                Loading attendance data...
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {attendanceData.map((day, index) => (
                <div key={index} style={{
                  border: `2px solid ${getStatusColor(day.status)}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  background: 'white',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                        {format(day.date, 'EEEE, MMM dd')}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {format(day.date, 'yyyy')}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: getStatusColor(day.status)
                    }}>
                      {getStatusIcon(day.status)}
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>
                        {day.status}
                      </span>
                    </div>
                  </div>
                  
                  {editingDay && isSameDay(editingDay.date, day.date) ? (
                    // Edit form
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                          Check In Time
                        </label>
                        <input
                          type="time"
                          value={editData.inTime}
                          onChange={(e) => setEditData({ ...editData, inTime: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                          Check Out Time
                        </label>
                        <input
                          type="time"
                          value={editData.outTime}
                          onChange={(e) => setEditData({ ...editData, outTime: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                          Reason for Edit
                        </label>
                        <textarea
                          value={editData.reason}
                          onChange={(e) => setEditData({ ...editData, reason: e.target.value })}
                          placeholder="Please provide a reason for this edit..."
                          rows="2"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={saveEdit}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <Save size={16} />
                          Save Request
                        </button>
                        <button
                          onClick={cancelEditing}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            background: 'var(--background-alt)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.375rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {day.status !== 'weekend' && (
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr', 
                          gap: '0.75rem',
                          fontSize: '0.875rem'
                        }}>
                          <div>
                            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Check In</div>
                            <div style={{ fontWeight: '500' }}>
                              {day.checkIn ? format(day.checkIn, 'HH:mm') : '-'}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Check Out</div>
                            <div style={{ fontWeight: '500' }}>
                              {day.checkOut ? format(day.checkOut, 'HH:mm') : '-'}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Hours</div>
                            <div style={{ fontWeight: '500', color: getStatusColor(day.status) }}>
                              {day.totalHours}
                            </div>
                          </div>
                        </div>
                      )}

                      {isDayEditable(day) && (
                        <button
                          onClick={() => startEditing(day)}
                          style={{
                            marginTop: '0.75rem',
                            width: 'auto',
                            padding: '0.25rem 0.5rem',
                            background: 'transparent',
                            color: 'var(--primary-color)',
                            border: '1px solid var(--primary-color)',
                            borderRadius: '0.25rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem'
                          }}
                        >
                          <Edit size={12} />
                          Edit
                        </button>
                      )}

                      {day.notes && (
                        <div style={{ 
                          marginTop: '0.75rem', 
                          padding: '0.5rem', 
                          background: 'var(--background-alt)', 
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          fontStyle: 'italic'
                        }}>
                          {day.notes}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                📋 {modalType} - {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s ease',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            </div>
            
            {/* Modal Body */}
            <div style={{
              padding: '1.5rem',
              maxHeight: 'calc(80vh - 120px)',
              overflowY: 'auto'
            }}>
              {filteredDays.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'var(--text-secondary)'
                }}>
                  <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No {modalType.toLowerCase()} found</p>
                  <p style={{ fontSize: '0.875rem' }}>No records match this category for the selected month.</p>
                </div>
              ) : (
                <div>
                  <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'var(--background-alt)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>Total: {filteredDays.length} days</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Found in {format(currentMonth, 'MMMM yyyy')}</div>
                    </div>
                    {modalType === 'Present Days' && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#10b981' }}>
                          {Math.round((filteredDays.length / (monthlyStats.workingDays || 1)) * 100)}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attendance Rate</div>
                      </div>
                    )}
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem'
                  }}>
                    {filteredDays.map((day, index) => (
                      <div key={index} style={{
                        border: `2px solid ${getStatusColor(day.status)}`,
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        background: 'white',
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.75rem'
                        }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                              {format(day.date, 'EEEE')}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              {format(day.date, 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: getStatusColor(day.status)
                          }}>
                            {getStatusIcon(day.status)}
                            <span style={{ fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>
                              {day.status}
                            </span>
                          </div>
                        </div>
                        
                        {day.status !== 'weekend' && (
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.75rem',
                            fontSize: '0.875rem'
                          }}>
                            <div>
                              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Check In</div>
                              <div style={{ fontWeight: '500' }}>
                                {day.checkIn ? format(day.checkIn, 'HH:mm') : '-'}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Check Out</div>
                              <div style={{ fontWeight: '500' }}>
                                {day.checkOut ? format(day.checkOut, 'HH:mm') : '-'}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Hours</div>
                              <div style={{ fontWeight: '500', color: getStatusColor(day.status) }}>
                                {day.totalHours}
                              </div>
                            </div>
                            <div>
                              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Breaks</div>
                              <div style={{ fontWeight: '500' }}>
                                {day.breaks}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {day.notes && (
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.5rem',
                            background: 'var(--background-alt)',
                            borderRadius: '0.5rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic'
                          }}>
                            📝 {day.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;