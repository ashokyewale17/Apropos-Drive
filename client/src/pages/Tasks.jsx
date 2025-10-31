import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { 
  CheckCircle, Clock, AlertCircle, Plus, Filter, Search, 
  Calendar, User, Target, FileText, Settings, Bell
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, addDays, subDays } from 'date-fns';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed, overdue
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    // Mock data - in real app, this would come from API
    const mockTasks = [
      {
        id: 1,
        title: 'Complete User Authentication Module',
        description: 'Implement secure login/logout functionality with JWT tokens and password hashing',
        priority: 'high',
        status: 'pending',
        assignedBy: 'John Smith',
        assignedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        category: 'Development',
        progress: 65,
        estimatedHours: 8,
        actualHours: 5
      },
      {
        id: 2,
        title: 'Update Documentation',
        description: 'Review and update API documentation for the new features',
        priority: 'medium',
        status: 'pending',
        assignedBy: 'Sarah Johnson',
        assignedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        category: 'Documentation',
        progress: 30,
        estimatedHours: 4,
        actualHours: 1
      },
      {
        id: 3,
        title: 'Code Review for Feature Branch',
        description: 'Review the pull request for the new dashboard feature',
        priority: 'high',
        status: 'completed',
        assignedBy: 'Mike Chen',
        assignedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        category: 'Review',
        progress: 100,
        estimatedHours: 2,
        actualHours: 2
      },
      {
        id: 4,
        title: 'Database Optimization',
        description: 'Optimize database queries and add proper indexing',
        priority: 'low',
        status: 'pending',
        assignedBy: 'Emily Davis',
        assignedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        category: 'Performance',
        progress: 0,
        estimatedHours: 12,
        actualHours: 0
      },
      {
        id: 5,
        title: 'Team Meeting Preparation',
        description: 'Prepare presentation slides for quarterly review meeting',
        priority: 'medium',
        status: 'overdue',
        assignedBy: 'Alex Wilson',
        assignedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        category: 'Presentation',
        progress: 80,
        estimatedHours: 6,
        actualHours: 5
      }
    ];

    setTasks(mockTasks);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'overdue': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getDueDateStatus = (dueDate) => {
    if (isToday(dueDate)) return 'today';
    if (isTomorrow(dueDate)) return 'tomorrow';
    if (isYesterday(dueDate)) return 'yesterday';
    if (dueDate < new Date()) return 'overdue';
    return 'upcoming';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateTaskProgress = (taskId, newProgress) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, progress: newProgress, status: newProgress === 100 ? 'completed' : 'pending' }
        : task
    ));
  };

  const markTaskComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: 'completed', 
            progress: 100, 
            completedDate: new Date() 
          }
        : task
    ));
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
                📋 My Tasks
              </h1>
              <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                Manage and track your assigned tasks
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {tasks.filter(t => t.status === 'pending').length}
              </div>
              <p style={{ fontSize: '1rem', opacity: 0.8 }}>
                Pending Tasks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ marginBottom: '2rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
              <Search size={16} style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-secondary)' 
              }} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  background: '#ffffff',
                  color: '#1f2937'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'pending', 'completed', 'overdue'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    background: filter === filterType ? 'var(--primary-color)' : 'white',
                    color: filter === filterType ? 'white' : 'var(--text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {filterType}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {filteredTasks.map((task) => (
          <div key={task.id} className="card" style={{ 
            border: 'none', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderLeft: `4px solid ${getPriorityColor(task.priority)}`
          }}>
            <div className="card-body" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                      {task.title}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `${getPriorityColor(task.priority)}20`,
                      color: getPriorityColor(task.priority)
                    }}>
                      {task.priority}
                    </span>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: `${getStatusColor(task.status)}20`,
                      color: getStatusColor(task.status)
                    }}>
                      {task.status}
                    </span>
                  </div>
                  
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.875rem', 
                    marginBottom: '1rem',
                    lineHeight: '1.5'
                  }}>
                    {task.description}
                  </p>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <User size={12} />
                      Assigned by {task.assignedBy}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={12} />
                      Due {format(task.dueDate, 'MMM dd, yyyy')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Target size={12} />
                      {task.category}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Progress</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {task.progress}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--background-alt)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${task.progress}%`,
                        height: '100%',
                        background: task.status === 'completed' ? 'var(--success-color)' : 'var(--primary-color)',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => markTaskComplete(task.id)}
                      style={{
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        background: 'var(--success-color)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Task Details */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem',
                padding: '1rem',
                background: 'var(--background-alt)',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Estimated Hours
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    {task.estimatedHours}h
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Actual Hours
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    {task.actualHours}h
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Assigned Date
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    {format(task.assignedDate, 'MMM dd')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Due Status
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500',
                    color: getDueDateStatus(task.dueDate) === 'overdue' ? 'var(--danger-color)' :
                           getDueDateStatus(task.dueDate) === 'today' ? 'var(--warning-color)' :
                           'var(--text-primary)'
                  }}>
                    {getDueDateStatus(task.dueDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="card" style={{ border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div className="card-body" style={{ padding: '3rem', textAlign: 'center' }}>
            <FileText size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              No tasks found
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'No tasks match the selected filter'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
