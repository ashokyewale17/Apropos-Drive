import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  Users, Clock, FileText, TrendingUp, AlertCircle, CheckCircle, Calendar, Timer,
  BarChart3, DollarSign, Target, Award, Activity, Settings, RefreshCw, Download,
  Filter, Search, Plus, ArrowUpRight, ArrowDownRight, Eye, Edit, Trash2,
  MapPin, Phone, Mail, Star, Briefcase, UserPlus, GitBranch, PieChart, TrendingDown, Edit3
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subDays, isToday, isThisWeek } from 'date-fns';


// Add pulse animation styles
const pulseStyle = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.3; }
    100% { opacity: 1; }
  }
  :root {
    --info-color: #3b82f6;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = pulseStyle;
  document.head.appendChild(styleSheet);
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 7,
    activeToday: 6,
    avgHoursPerDay: '8.2',
    pendingLeaves: 2,
    onLeave: 1,
    absentToday: 0,
    monthlyHours: 1200,
    productivity: 92.5,
    newHires: 2,
    efficiency: 88.7,
    attendanceRate: 95.8
  });

  const [timeFilter, setTimeFilter] = useState('today');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [employeeStatus, setEmployeeStatus] = useState([]);
  const [realEmployees, setRealEmployees] = useState([]);
  const [attendanceChart, setAttendanceChart] = useState([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatusType, setSelectedStatusType] = useState('');
  const [statusEmployees, setStatusEmployees] = useState([]);
  const [settings, setSettings] = useState({
    companyName: 'Your Company',
    workingHours: { start: '09:00', end: '18:00' },
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    overtimeThreshold: 40,
    lateThreshold: 15,
    autoBackup: true,
    theme: 'light'
  });
  const [viewMode, setViewMode] = useState('table'); // Add viewMode state - default to 'table'

  useEffect(() => {
    loadDashboardData();
    generateAnalyticsData();
    
    // Immediately check for any recent check-ins after loading data
    setTimeout(() => {
      checkForEmployeeCheckIns();
    }, 1000);
  }, []);

  

  // Update attendance data when component updates
  useEffect(() => {
    if (realEmployees.length > 0) {
      // Regenerate weekly attendance data - only present and absent, excluding weekends
      const generateWeeklyAttendanceData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          // Check if it's a weekend (0 = Sunday, 6 = Saturday)
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          if (isWeekend) {
            // For weekends, show 0 present and 0 absent
            return {
              date: format(date, 'EEE'), // Show day of week instead of date
              present: 0,
              absent: 0
            };
          } else {
            // For weekdays, generate realistic attendance data
            const basePresent = Math.max(1, realEmployees.length - Math.floor(Math.random() * 2)); // Most employees present
            return {
              date: format(date, 'EEE'), // Show day of week instead of date
              present: basePresent,
              absent: Math.min(realEmployees.length - basePresent, Math.floor(Math.random() * 2))
            };
          }
        });
        return last7Days;
      };
      
      const weeklyAttendanceData = generateWeeklyAttendanceData();
      setAttendanceChart(weeklyAttendanceData);
    }
  }, [realEmployees]);

  useEffect(() => {
    // Set up real-time polling once on component mount
    console.log('Setting up real-time polling system...');
    
    // Check for updates every 5 seconds for more responsive updates
    const realTimeInterval = setInterval(() => {
      checkForEmployeeCheckIns();
    }, 5000);
    
    return () => {
      console.log('Cleaning up real-time polling system');
      clearInterval(realTimeInterval);
    };
  }, []); // No dependencies to prevent re-running

  useEffect(() => {
    if (realEmployees.length > 0) {
      generateMonthlyAttendance(realEmployees);
    }
  }, [realEmployees, selectedMonth, selectedYear]);

  const generateAnalyticsData = () => {
    const currentDate = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: format(date, 'MMM dd'),
        attendance: Math.floor(Math.random() * 30) + 85,
        productivity: Math.floor(Math.random() * 20) + 80,
      };
    });

    const departmentStats = [
      { name: 'Engineering', employees: 25, attendance: 92, productivity: 88 },
      { name: 'Marketing', employees: 12, attendance: 89, productivity: 91 },
      { name: 'Design', employees: 8, attendance: 94, productivity: 85 },
      { name: 'Sales', employees: 15, attendance: 87, productivity: 93 },
      { name: 'Finance', employees: 6, attendance: 96, productivity: 89 },
      { name: 'HR', employees: 4, attendance: 91, productivity: 87 }
    ];

    const leaveAnalytics = {
      thisMonth: {
        total: 23,
        approved: 18,
        pending: 3,
        rejected: 2
      },
      lastMonth: {
        total: 19,
        approved: 16,
        pending: 0,
        rejected: 3
      },
      types: [
        { type: 'Sick Leave', count: 8, percentage: 35 },
        { type: 'Vacation', count: 10, percentage: 43 },
        { type: 'Personal', count: 3, percentage: 13 },
        { type: 'Emergency', count: 2, percentage: 9 }
      ]
    };

    // Calculate comp off days - employees who worked on weekends/holidays
    const compOffEmployees = realEmployees.filter(emp => {
      // In a real implementation, this would check actual attendance records
      // For demo purposes, we'll simulate with a random selection
      const weekendWorkers = [1, 3, 5]; // Employee IDs who worked weekends
      return weekendWorkers.includes(emp.id);
    });

    setAnalyticsData({
      weeklyTrends: last7Days,
      departmentStats,
      leaveAnalytics,
      overallMetrics: {
        avgAttendance: 91.2,
        avgProductivity: 89.1,
        totalCompOffDays: compOffEmployees.length,
        employeeSatisfaction: 4.2
      }
    });
  };
    // Real employee database
  const loadDashboardData = () => {
    // Try to load existing employee data from localStorage first
    const savedEmployees = localStorage.getItem('realEmployees');
    let employees = [];
    
    if (savedEmployees) {
      try {
        employees = JSON.parse(savedEmployees);
        // Update employee status based on today's check-ins
        const today = format(new Date(), 'yyyy-MM-dd');
        employees = employees.map(emp => {
          const checkInKey = `checkIn_${emp.id}_${today}`;
          const checkInData = localStorage.getItem(checkInKey);
          
          if (checkInData) {
            try {
              const data = JSON.parse(checkInData);
              if (data.checkedIn && !data.checkOutTime) {
                return {
                  ...emp,
                  status: 'active',
                  checkIn: format(new Date(data.checkInTime), 'HH:mm'),
                  location: data.location || 'Office'
                };
              } else if (data.checkOutTime) {
                // Calculate hours worked
                const checkInTime = new Date(data.checkInTime);
                const checkOutTime = new Date(data.checkOutTime);
                const diffMs = checkOutTime - checkInTime;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const hoursWorked = `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
                
                return {
                  ...emp,
                  status: 'completed',
                  checkIn: format(new Date(data.checkInTime), 'HH:mm'),
                  location: data.location || 'Office',
                  hours: hoursWorked
                };
              }
            } catch (error) {
              console.error('Error parsing check-in data for employee', emp.id, ':', error);
            }
          }
          
          return emp;
        });
      } catch (error) {
        console.error('Error loading saved employee data:', error);
        // Fall back to default data if there's an error
        employees = getDefaultEmployees();
      }
    } else {
      // Use default data if no saved data exists
      employees = getDefaultEmployees();
    }

    setRealEmployees(employees);
    setEmployeeStatus(employees);
    
    // Save to localStorage for login authentication
    try {
      localStorage.setItem('realEmployees', JSON.stringify(employees));
    } catch (error) {
      console.log('Failed to save employee data to localStorage:', error);
    }

    // Update stats based on real data
    const activeCount = employees.filter(emp => emp.status === 'active' || emp.status === 'completed').length;
    const leaveCount = employees.filter(emp => emp.status === 'leave').length;
    const absentCount = employees.filter(emp => emp.status === 'absent').length;
    const avgProductivity = employees.reduce((sum, emp) => sum + emp.productivity, 0) / employees.length;
    
    setStats(prev => ({
      ...prev,
      totalEmployees: employees.length,
      activeToday: activeCount,
      onLeave: leaveCount,
      absentToday: absentCount,
      productivity: avgProductivity.toFixed(1),
      attendanceRate: ((activeCount / employees.length) * 100).toFixed(1)
    }));

    // Real activity data based on employees
    setRecentActivity([
      {
        id: 1,
        type: 'check-in',
        employee: 'Tushar Mhaskar',
        department: 'Admin',
        time: new Date(Date.now() - 15 * 60 * 1000),
        status: 'success',
        avatar: 'TM'
      },
      {
        id: 2,
        type: 'leave-request',
        employee: 'Harshal Lohar',
        department: 'Software',
        time: new Date(Date.now() - 45 * 60 * 1000),
        status: 'pending',
        avatar: 'HL'
      },
      {
        id: 3,
        type: 'task-completed',
        employee: 'Ashok Yewale',
        department: 'Software',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success',
        avatar: 'AY'
      },
      {
        id: 4,
        type: 'check-in',
        employee: 'Pinky Chakrabarty',
        department: 'Operations',
        time: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'success',
        avatar: 'PC'
      }
    ]);
  };

  // Helper function to get default employee data
  const getDefaultEmployees = () => {
    return [
      {
        id: 1,
        name: 'Tushar Mhaskar',
        email: 'tushar.mhaskar@company.com',
        password: 'admin123', // In real app, this should be hashed
        department: 'Admin',
        role: 'Admin & HR',
        status: 'active',
        checkIn: '08:30',
        hours: '8:00',
        location: 'Office',
        productivity: 98,
        joinDate: '2023-01-15',
        phone: '+91-9876543210',
        isAdmin: true
      },
      {
        id: 2,
        name: 'Vijay Solanki',
        email: 'vijay.solanki@company.com',
        password: 'test123',
        department: 'Testing',
        role: 'QA Engineer',
        status: 'active',
        checkIn: '09:00',
        hours: '7:30',
        location: 'Office',
        productivity: 94,
        joinDate: '2023-02-20',
        phone: '+91-9876543211'
      },
      {
        id: 3,
        name: 'Pinky Chakrabarty',
        email: 'pinky.chakrabarty@company.com',
        password: 'ops123',
        department: 'Operations',
        role: 'Operations Manager',
        status: 'active',
        checkIn: '08:45',
        hours: '8:15',
        location: 'Office',
        productivity: 96,
        joinDate: '2023-01-10',
        phone: '+91-9876543212'
      },
      {
        id: 4,
        name: 'Sanket Pawal',
        email: 'sanket.pawal@company.com',
        password: 'design123',
        department: 'Design',
        role: 'UI/UX Designer',
        status: 'active',
        checkIn: '09:15',
        hours: '7:45',
        location: 'Remote',
        productivity: 92,
        joinDate: '2023-03-05',
        phone: '+91-9876543213'
      },
      {
        id: 5,
        name: 'Ashok Yewale',
        email: 'ashok.yewale@company.com',
        password: 'soft123',
        department: 'Software',
        role: 'Software Developer',
        status: 'active',
        checkIn: '08:15',
        hours: '8:30',
        location: 'Office',
        productivity: 95,
        joinDate: '2023-02-01',
        phone: '+91-9876543214'
      },
      {
        id: 6,
        name: 'Harshal Lohar',
        email: 'harshal.lohar@company.com',
        password: 'soft123',
        department: 'Software',
        role: 'Senior Developer',
        status: 'absent',
        checkIn: '-',
        hours: '0:00',
        location: 'Absent',
        productivity: 0,
        joinDate: '2022-12-15',
        phone: '+91-9876543215'
      },
      {
        id: 7,
        name: 'Prasanna Pandit',
        email: 'prasanna.pandit@company.com',
        password: 'embed123',
        department: 'Embedded',
        role: 'Embedded Engineer',
        status: 'late',
        checkIn: '10:30',
        hours: '6:30',
        location: 'Office',
        productivity: 85,
        joinDate: '2023-03-20',
        phone: '+91-9876543216'
      }
    ];
  };

  const generateMonthlyAttendance = (employees) => {
    const monthlyData = employees.map(employee => {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const attendanceRecords = [];
      let presentDays = 0;
      let totalHours = 0;
      let leaveDays = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, selectedMonth, day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        if (!isWeekend && date <= new Date()) {
          const isPresent = Math.random() > 0.1; // 90% attendance rate
          const isLate = Math.random() < 0.15; // 15% late rate
          const isOnLeave = Math.random() < 0.05; // 5% leave rate
          
          let status = 'present';
          let inTime = '';
          let outTime = '';
          let hoursWorked = 0;
          
          if (isOnLeave) {
            status = 'leave';
            leaveDays++;
          } else if (isPresent) {
            const baseInHour = isLate ? 9 + Math.floor(Math.random() * 2) : 8 + Math.floor(Math.random() * 2);
            const inMinutes = Math.floor(Math.random() * 60);
            const outHour = baseInHour + 8 + Math.floor(Math.random() * 2);
            const outMinutes = Math.floor(Math.random() * 60);
            
            inTime = `${baseInHour.toString().padStart(2, '0')}:${inMinutes.toString().padStart(2, '0')}`;
            outTime = `${outHour.toString().padStart(2, '0')}:${outMinutes.toString().padStart(2, '0')}`;
            
            const inDate = new Date(date);
            inDate.setHours(baseInHour, inMinutes);

            const outDate = new Date(date);
            outDate.setHours(outHour, outMinutes);
            
            hoursWorked = (outDate - inDate) / (1000 * 60 * 60);
            totalHours += hoursWorked;
            presentDays++;
            
            if (isLate) {
              status = 'late';
            }
          } else {
            status = 'absent';
          }
          
          attendanceRecords.push({
            date: day,
            status,
            inTime,
            outTime,
            hoursWorked: hoursWorked.toFixed(1)
          });
        } else if (isWeekend) {
          attendanceRecords.push({
            date: day,
            status: 'weekend',
            inTime: '',
            outTime: '',
            hoursWorked: '0'
          });
        }
      }
      
      const avgHoursDecimal = presentDays > 0 ? (totalHours / presentDays) : 0;
      const avgHours = presentDays > 0 ? (totalHours / presentDays).toFixed(1) : '0.0';
      
      return {
        employee,
        attendanceRecords,
        summary: {
          presentDays,
          leaveDays,
          totalHours: totalHours.toFixed(1),
          avgHours,
          attendanceRate: ((presentDays / (daysInMonth - 8)) * 100).toFixed(1) // Excluding weekends
        }
      };
    });
    
    setMonthlyAttendance(monthlyData);
  };



  const handleMonthChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    // Regenerate attendance data for new month
    generateMonthlyAttendance(realEmployees);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">🟢 Active</span>;
      case 'break':
        return <span className="badge badge-warning">☕ Break</span>;
      case 'meeting':
        return <span className="badge badge-info">👥 Meeting</span>;
      case 'late':
        return <span className="badge badge-danger">⏰ Late</span>;
      case 'leave':
        return <span className="badge badge-info">🏖️ On Leave</span>;
      case 'absent':
        return <span className="badge badge-danger">❌ Absent</span>;
      default:
        return <span className="badge">📴 Offline</span>;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'check-in':
        return '🟢';
      case 'check-out':
        return '🔴';
      case 'leave-request':
        return '📝';
      case 'late-arrival':
        return '⏰';
      case 'task-completed':
        return '✅';
      case 'overtime':
        return '🌙';
      case 'new-hire':
        return '👋';
      default:
        return '📋';
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'check-in':
        return `${activity.employee} checked in`;
      case 'check-out':
        return `${activity.employee} checked out`;
      case 'leave-request':
        return `${activity.employee} requested leave`;
      case 'late-arrival':
        return `${activity.employee} arrived late`;
      case 'task-completed':
        return `${activity.employee} completed a task`;
      case 'overtime':
        return `${activity.employee} working overtime`;
      case 'new-hire':
        return `${activity.employee} joined the team`;
      default:
        return `${activity.employee} activity`;
    }
  };

  // Real-time check for employee check-ins (optimized to prevent spam)
  const checkForEmployeeCheckIns = () => {
    // Check for admin notifications from employees
    const keys = Object.keys(localStorage);
    const adminNotificationKeys = keys.filter(key => key.startsWith('adminNotification_'));
    
    // Process all notifications
    if (adminNotificationKeys.length > 0) {
      const newActivities = [];
      let hasValidNotifications = false;
      
      adminNotificationKeys.forEach(key => {
        const notificationData = localStorage.getItem(key);
        if (notificationData) {
          try {
            const notification = JSON.parse(notificationData);
            const notificationTime = new Date(notification.timestamp);
            
            // Process notifications from the last 5 minutes to avoid missing any
            if (Date.now() - notificationTime.getTime() < 300000) { // 5 minutes
              console.log('Processing notification:', notification);
              
              if (notification.type === 'employee_checkin') {
                newActivities.push({
                  id: Date.now() + Math.random(),
                  type: 'check-in',
                  employee: notification.employeeName,
                  department: notification.department,
                  time: new Date(notification.checkInTime),
                  status: 'success',
                  avatar: notification.employeeName.split(' ').map(n => n[0]).join('')
                });
                
                // Also add a notification to the UI
                const notificationMsg = {
                  title: 'Employee Check-in',
                  message: `${notification.employeeName} has checked in at ${format(new Date(notification.checkInTime), 'HH:mm')}`,
                  type: 'success',
                  timestamp: new Date().toISOString()
                };
                
                // In a real app, we would use the addNotification function from useAuth
                // For now, we'll just log it
                console.log('New notification:', notificationMsg);
                
                hasValidNotifications = true;
              } else if (notification.type === 'employee_checkout') {
                newActivities.push({
                  id: Date.now() + Math.random(),
                  type: 'check-out',
                  employee: notification.employeeName,
                  department: notification.department,
                  time: new Date(notification.checkOutTime),
                  status: 'success',
                  avatar: notification.employeeName.split(' ').map(n => n[0]).join('')
                });
                
                // Also add a notification to the UI
                const notificationMsg = {
                  title: 'Employee Check-out',
                  message: `${notification.employeeName} has checked out`,
                  type: 'info',
                  timestamp: new Date().toISOString()
                };
                
                // In a real app, we would use the addNotification function from useAuth
                // For now, we'll just log it
                console.log('New notification:', notificationMsg);
                
                hasValidNotifications = true;
              }
            }
            
            // Always remove the notification after processing (or if it's too old)
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error processing notification:', error);
            localStorage.removeItem(key);
          }
        }
      });
      
      // Only update state if we have valid new notifications
      if (hasValidNotifications) {
        console.log('📊 Processing', newActivities.length, 'new employee activities');
        
        // Update recent activity
        if (newActivities.length > 0) {
          setRecentActivity(prev => [...newActivities, ...prev].slice(0, 15));
        }
        
        // Update stats and employee status
        updateEmployeeStats();
      }
    }
  };
  
  // Separate function to update stats and employee status without full reload
  const updateEmployeeStats = () => {
    const savedEmployees = localStorage.getItem('realEmployees');
    if (savedEmployees) {
      try {
        let employees = JSON.parse(savedEmployees);
        
        // Update employee status based on today's check-ins
        const today = format(new Date(), 'yyyy-MM-dd');
        const updatedEmployees = employees.map(emp => {
          const checkInKey = `checkIn_${emp.id}_${today}`;
          const checkInData = localStorage.getItem(checkInKey);
          
          if (checkInData) {
            try {
              const data = JSON.parse(checkInData);
              if (data.checkedIn) {
                return {
                  ...emp,
                  status: 'active',
                  checkIn: format(new Date(data.checkInTime), 'HH:mm'),
                  location: data.location || 'Office', // Use location from check-in data or default to Office
                  hours: '0:00' // Reset hours when checking in
                };
              } else if (data.checkOutTime) {
                // Calculate hours worked
                const checkInTime = new Date(data.checkInTime);
                const checkOutTime = new Date(data.checkOutTime);
                const diffMs = checkOutTime - checkInTime;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const hoursWorked = `${diffHours}:${diffMinutes.toString().padStart(2, '0')}`;
                
                return {
                  ...emp,
                  status: 'completed',
                  checkIn: format(new Date(data.checkInTime), 'HH:mm'),
                  location: data.location || 'Office', // Use location from check-in data or default to Office
                  hours: hoursWorked
                };
              }
            } catch (error) {
              console.error('Error parsing check-in data for employee', emp.id, ':', error);
            }
          }
          
          // If no check-in data, keep original status but mark as not checked in today
          return {
            ...emp,
            status: emp.status === 'active' ? 'absent' : emp.status, // Mark previously active employees as absent if no check-in
            checkIn: emp.status === 'active' ? '-' : emp.checkIn
          };
        });
        
        // Update employee arrays
        setRealEmployees(updatedEmployees);
        setEmployeeStatus(updatedEmployees);
        
        // Save updated employee data back to localStorage
        localStorage.setItem('realEmployees', JSON.stringify(updatedEmployees));
        
        // Calculate updated stats
        const activeCount = updatedEmployees.filter(emp => emp.status === 'active' || emp.status === 'completed').length;
        const leaveCount = updatedEmployees.filter(emp => emp.status === 'leave').length;
        const absentCount = updatedEmployees.filter(emp => emp.status === 'absent').length;
        
        setStats(prev => ({
          ...prev,
          totalEmployees: updatedEmployees.length,
          activeToday: activeCount,
          onLeave: leaveCount,
          absentToday: absentCount,
          attendanceRate: ((activeCount / updatedEmployees.length) * 100).toFixed(1)
        }));
        
        console.log('📊 Updated employee status:', {
          active: activeCount,
          leave: leaveCount,
          absent: absentCount
        });
        
      } catch (error) {
        console.error('Error updating employee stats:', error);
      }
    }
  };



  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      loadDashboardData();
      setIsRefreshing(false);
    }, 1000);
  };



  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <ArrowUpRight size={16} style={{ color: 'var(--success-color)' }} />;
      case 'down': return <ArrowDownRight size={16} style={{ color: 'var(--danger-color)' }} />;
      default: return <div style={{ width: 16, height: 16 }} />;
    }
  };

  const convertDecimalToHoursMinutes = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    // Handle case where minutes round to 60
    if (minutes === 60) {
      return `${hours + 1}h 0m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const filteredEmployees = employeeStatus.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Employee management functions
  const handleTotalEmployeesClick = () => {
    setShowEmployeeModal(true);
  };

  const handleEmployeeEdit = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleEmployeeSave = (updatedEmployee) => {
    const updatedEmployees = realEmployees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );
    setRealEmployees(updatedEmployees);
    setEmployeeStatus(updatedEmployees);
    setSelectedEmployee(null);
    
    // Save to localStorage for login authentication
    try {
      localStorage.setItem('realEmployees', JSON.stringify(updatedEmployees));
    } catch (error) {
      console.log('Failed to save employee data to localStorage:', error);
    }
  };

  const handleEmployeeDelete = (employeeId) => {
    const updatedEmployees = realEmployees.filter(emp => emp.id !== employeeId);
    setRealEmployees(updatedEmployees);
    setEmployeeStatus(updatedEmployees);
    
    // Save to localStorage for login authentication
    try {
      localStorage.setItem('realEmployees', JSON.stringify(updatedEmployees));
    } catch (error) {
      console.log('Failed to save employee data to localStorage:', error);
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalEmployees: updatedEmployees.length
    }));
  };

  const handleAddEmployee = (newEmployee) => {
    const employee = {
      ...newEmployee,
      id: Math.max(...realEmployees.map(e => e.id)) + 1,
      status: 'active',
      checkIn: '-',
      hours: '0:00',
      productivity: 0,
      joinDate: new Date().toISOString().split('T')[0]
    };
    const updatedEmployees = [...realEmployees, employee];
    setRealEmployees(updatedEmployees);
    setEmployeeStatus(updatedEmployees);
    
    // Save to localStorage for login authentication
    try {
      localStorage.setItem('realEmployees', JSON.stringify(updatedEmployees));
    } catch (error) {
      console.log('Failed to save employee data to localStorage:', error);
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalEmployees: updatedEmployees.length
    }));
  };

  const handleStatusCardClick = (statusType) => {
    let filteredEmployees = [];
    
    switch (statusType) {
      case 'active':
        filteredEmployees = realEmployees.filter(emp => emp.status === 'active');
        break;
      case 'absent':
        // Modified to show employees who have taken leave on prior days or applied for leave before current day
        filteredEmployees = realEmployees.filter(emp => {
          // First check if they're absent today
          if (emp.status === 'absent') return true;
          
          // Then check if they have applied for leave that includes today or future dates
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // In a real implementation, this would check actual leave requests
          // For demo purposes, we'll simulate with sample data
          const leaveRequests = [
            {
              employeeId: 2,
              startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
              endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
              status: 'approved'
            },
            {
              employeeId: 6,
              startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
              endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
              status: 'pending'
            }
          ];
          
          const hasLeaveToday = leaveRequests.some(leave => 
            leave.employeeId === emp.id && 
            leave.startDate <= today && 
            leave.endDate >= today && 
            (leave.status === 'approved' || leave.status === 'pending')
          );
          
          return hasLeaveToday;
        });
        break;
      case 'late':
        filteredEmployees = realEmployees.filter(emp => emp.status === 'late');
        break;
      default:
        filteredEmployees = [];
    }
    
    setSelectedStatusType(statusType);
    setStatusEmployees(filteredEmployees);
    setShowStatusModal(true);
  };

  return (
    <div style={{ padding: '1.5rem', background: 'var(--background-alt)', minHeight: '100vh', width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
      {/* Modern Professional Welcome Card */}
      <div className="card" style={{ 
        marginBottom: '2rem', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        maxWidth: '100%',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '30%',
          background: 'rgba(255, 255, 255, 0.1)',
          clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
        }}></div>
        <div className="card-body" style={{ color: 'white', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.2)'
                }}>
                  👋
                </span>
                Welcome back, {user.name}
              </h1>
              <p style={{ fontSize: '1rem', opacity: 0.9, margin: '0 0 1.25rem 0', maxWidth: '500px' }}>
                Here's your company overview for {format(new Date(), 'MMMM d, yyyy')}
              </p>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Active Employees</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.1rem' }}>{stats.activeToday} of {stats.totalEmployees}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }}>
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Productivity</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '0.1rem' }}>{stats.productivity}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <button 
                onClick={refreshData}
                className="btn" 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white', 
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(5px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                disabled={isRefreshing}
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', width: '100%', maxWidth: '100%' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary-color)', cursor: 'pointer' }} onClick={handleTotalEmployeesClick}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value">{stats.totalEmployees}</div>
              <div className="stat-label">
                <Users size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Total Employees
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'var(--primary-color)', borderRadius: '0.5rem' }}>
              <Users size={20} style={{ color: 'white' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--success-color)', marginTop: '0.5rem' }}>
            <ArrowUpRight size={14} style={{ display: 'inline' }} /> Click to manage employees
          </div>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid var(--success-color)', cursor: 'pointer', transition: 'all 0.2s ease' }} 
             onClick={() => handleStatusCardClick('active')}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'translateY(-2px)';
               e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.15)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'translateY(0)';
               e.currentTarget.style.boxShadow = '';
             }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value" style={{ color: 'var(--success-color)' }}>
                {stats.activeToday}
              </div>
              <div className="stat-label">
                <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Active Today
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'var(--success-color)', borderRadius: '0.5rem' }}>
              <CheckCircle size={20} style={{ color: 'white' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--success-color)', marginTop: '0.5rem' }}>
            <ArrowUpRight size={14} style={{ display: 'inline' }} /> Click to view active employees
          </div>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid var(--danger-color)', cursor: 'pointer', transition: 'all 0.2s ease' }}
             onClick={() => handleStatusCardClick('absent')}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'translateY(-2px)';
               e.currentTarget.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.15)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'translateY(0)';
               e.currentTarget.style.boxShadow = '';
             }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value" style={{ color: 'var(--danger-color)' }}>
                {realEmployees.filter(emp => {
                  // Show count of employees who are absent today or have approved/pending leave for today
                  if (emp.status === 'absent') return true;
                  
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  // Sample leave data for demonstration
                  const leaveRequests = [
                    {
                      employeeId: 2,
                      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
                      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                      status: 'approved'
                    },
                    {
                      employeeId: 6,
                      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
                      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                      status: 'pending'
                    }
                  ];
                  
                  const hasLeaveToday = leaveRequests.some(leave => 
                    leave.employeeId === emp.id && 
                    leave.startDate <= today && 
                    leave.endDate >= today && 
                    (leave.status === 'approved' || leave.status === 'pending')
                  );
                  
                  return hasLeaveToday;
                }).length}
              </div>
              <div className="stat-label">
                <AlertCircle size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                On Leave / Absent
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'var(--danger-color)', borderRadius: '0.5rem' }}>
              <AlertCircle size={20} style={{ color: 'white' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--danger-color)', marginTop: '0.5rem' }}>
            <ArrowUpRight size={14} style={{ display: 'inline' }} /> Employees on leave or absent today
          </div>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid var(--info-color, #3b82f6)', cursor: 'pointer', transition: 'all 0.2s ease' }}
             onClick={() => {
               // Show comp off employees instead of analytics modal
               const compOffEmployees = realEmployees.filter(emp => {
                 const weekendWorkers = [1, 3, 5]; // Employee IDs who worked weekends
                 return weekendWorkers.includes(emp.id);
               });
               setSelectedStatusType('compOff');
               setStatusEmployees(compOffEmployees);
               setShowStatusModal(true);
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.transform = 'translateY(-2px)';
               e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.transform = 'translateY(0)';
               e.currentTarget.style.boxShadow = '';
             }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value" style={{ color: 'var(--info-color, #3b82f6)' }}>
                {/* Calculate comp off days based on employees who worked on weekends/holidays */}
                {realEmployees.filter(emp => {
                  // In a real implementation, this would check actual attendance records
                  // For demo purposes, we'll simulate with a random selection
                  const weekendWorkers = [1, 3, 5]; // Employee IDs who worked weekends
                  return weekendWorkers.includes(emp.id);
                }).length}
              </div>
              <div className="stat-label">
                <Clock size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Comp Off Days
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'var(--info-color, #3b82f6)', borderRadius: '0.5rem' }}>
              <Clock size={20} style={{ color: 'white' }} />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--info-color, #3b82f6)', marginTop: '0.5rem' }}>
            <ArrowUpRight size={14} style={{ display: 'inline' }} /> Employees with comp off days
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '200px' }}>
              <Search size={16} style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search employees..."
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
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="HR">HR</option>
            </select>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        {/* Employee Status - Enhanced */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} />
              Employee Status
              <span style={{ 
                background: 'var(--success-color)', 
                color: 'white', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '1rem', 
                fontSize: '0.75rem' 
              }}>
                Live
              </span>
            </h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {filteredEmployees.length} of {stats.totalEmployees} employees
              </span>
              <button className="btn btn-sm btn-outline">
                <Eye size={14} />
                View All
              </button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {filteredEmployees.map((employee) => (
                <div key={employee.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background-alt)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
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
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{employee.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>
                          <Briefcase size={12} style={{ marginRight: '0.25rem' }} />
                          {employee.department}
                        </span>
                        <span>
                          <MapPin size={12} style={{ marginRight: '0.25rem' }} />
                          {employee.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {getStatusBadge(employee.status)}
                      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        {employee.hours}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Check-in: {employee.checkIn !== '-' ? employee.checkIn : 'Not checked in'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem' }}>Productivity:</span>
                      <div style={{
                        width: '60px',
                        height: '4px',
                        background: 'var(--border-color)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${employee.productivity}%`,
                          height: '100%',
                          background: employee.productivity >= 90 ? 'var(--success-color)' : 
                                     employee.productivity >= 75 ? 'var(--warning-color)' : 'var(--danger-color)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{employee.productivity}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Attendance Trends Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} />
              Real-Time Weekly Attendance
              <span style={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)', 
                color: 'white', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '1rem', 
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                Live
              </span>
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select 
                value="current-week"
                style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.375rem', 
                  border: '1px solid var(--border-color)', 
                  fontSize: '0.75rem',
                  background: 'white'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="current-week">
                  Current Week
                </option>
              </select>
              <button className="btn btn-sm btn-outline" onClick={(e) => e.stopPropagation()}>
                <Download size={12} />
              </button>
            </div>
          </div>
          <div className="card-body">

            {/* Real-Time Employee Weekly Attendance Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '1.5rem', 
              marginBottom: '1rem'
            }}>
              {realEmployees.map((employee) => {
                // Generate real-time weekly attendance data for this employee
                const weeklyData = Array.from({ length: 7 }, (_, i) => {
                  const date = subDays(new Date(), 6 - i);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const today = new Date();
                  const isToday = date.toDateString() === today.toDateString();
                  
                  if (isWeekend) {
                    return {
                      date: format(date, 'EEE'),
                      status: 'weekend',
                      fullDate: format(date, 'yyyy-MM-dd')
                    };
                  } else {
                    // For real-time data, check actual employee status
                    let status = 'absent'; // default
                    
                    // Check if this is today and employee has checked in
                    if (isToday) {
                      if (employee.status === 'active' || employee.status === 'completed') {
                        status = employee.status === 'late' ? 'late' : 'present';
                      } else if (employee.status === 'late') {
                        status = 'late';
                      } else {
                        status = 'absent';
                      }
                    } else {
                      // For past days, use simulated data
                      const isPresent = Math.random() > 0.1; // 90% attendance rate
                      const isLate = isPresent && Math.random() < 0.2; // 20% of present days are late
                      status = isPresent ? (isLate ? 'late' : 'present') : 'absent';
                    }
                    
                    return {
                      date: format(date, 'EEE'),
                      status: status,
                      fullDate: format(date, 'yyyy-MM-dd'),
                      isToday: isToday
                    };
                  }
                });
                
                const presentCount = weeklyData.filter(d => d.status === 'present').length;
                const lateCount = weeklyData.filter(d => d.status === 'late').length;
                const absentCount = weeklyData.filter(d => d.status === 'absent').length;
                
                // Highlight if employee is active today
                const isActiveToday = employee.status === 'active' || employee.status === 'completed';
                
                return (
                  <div key={employee.id} style={{
                    border: isActiveToday ? '2px solid var(--success-color)' : '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    background: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: isActiveToday ? 'scale(1.02)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = isActiveToday ? 'scale(1.04)' : 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = isActiveToday ? 'scale(1.02)' : 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    {/* Live Indicator for Active Employees */}
                    {isActiveToday && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: 'var(--success-color)',
                        boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)',
                        animation: 'pulse 2s infinite'
                      }}></div>
                    )}
                    
                    {/* Employee Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-color), #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                        flexShrink: 0
                      }}>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 style={{ 
                          margin: 0, 
                          fontWeight: '600', 
                          fontSize: '1rem',
                          marginBottom: '0.25rem'
                        }}>
                          {employee.name}
                        </h4>
                        <p style={{ 
                          margin: 0, 
                          fontSize: '0.875rem', 
                          color: 'var(--text-secondary)' 
                        }}>
                          {employee.department}
                        </p>
                      </div>
                      <div style={{ 
                        marginLeft: 'auto', 
                        background: isActiveToday ? 'var(--success-color)' : 'var(--text-secondary)', 
                        color: 'white', 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {isActiveToday ? 'Active Now' : 'Offline'}
                      </div>
                    </div>
                    
                    {/* Weekly Stats */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gap: '0.75rem', 
                      marginBottom: '1.5rem' 
                    }}>
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '0.75rem', 
                        background: 'rgba(16, 185, 129, 0.1)', 
                        borderRadius: '0.5rem' 
                      }}>
                        <div style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '700', 
                          color: 'var(--success-color)',
                          marginBottom: '0.25rem' 
                        }}>
                          {presentCount}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Present</div>
                      </div>
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '0.75rem', 
                        background: 'rgba(245, 158, 11, 0.1)', 
                        borderRadius: '0.5rem' 
                      }}>
                        <div style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '700', 
                          color: 'var(--warning-color)',
                          marginBottom: '0.25rem' 
                        }}>
                          {lateCount}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Late</div>
                      </div>
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '0.75rem', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        borderRadius: '0.5rem' 
                      }}>
                        <div style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '700', 
                          color: 'var(--danger-color)',
                          marginBottom: '0.25rem' 
                        }}>
                          {absentCount}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Absent</div>
                      </div>
                    </div>
                    
                    {/* Weekly Attendance Grid with Real-Time Highlight */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(7, 1fr)', 
                      gap: '0.5rem' 
                    }}>
                      {weeklyData.map((day, index) => (
                        <div 
                          key={index}
                          style={{
                            textAlign: 'center',
                            padding: '0.5rem 0',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: 
                              day.status === 'present' ? 'rgba(16, 185, 129, 0.2)' :
                              day.status === 'late' ? 'rgba(245, 158, 11, 0.2)' :
                              day.status === 'absent' ? 'rgba(239, 68, 68, 0.2)' :
                              'rgba(156, 163, 175, 0.2)',
                            color: 
                              day.status === 'present' ? 'var(--success-color)' :
                              day.status === 'late' ? 'var(--warning-color)' :
                              day.status === 'absent' ? 'var(--danger-color)' :
                              'var(--text-secondary)',
                            border: day.isToday ? '2px solid var(--primary-color)' : '1px solid ' + 
                              (day.status === 'present' ? 'var(--success-color)' :
                              day.status === 'late' ? 'var(--warning-color)' :
                              day.status === 'absent' ? 'var(--danger-color)' :
                              'var(--border-color)'),
                            position: 'relative'
                          }}
                        >
                          <div style={{ fontSize: '0.625rem', marginBottom: '0.125rem' }}>{day.date}</div>
                          <div>
                            {day.status === 'present' ? '✓' : 
                             day.status === 'late' ? '⏰' : 
                             day.status === 'absent' ? '✗' : '—'}
                          </div>
                          {day.isToday && (
                            <div style={{
                              position: 'absolute',
                              top: '-4px',
                              right: '-4px',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'var(--primary-color)',
                              border: '1px solid white'
                            }}></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
        {/* Recent Activity Feed */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} />
              Recent Activity
              <span style={{ 
                background: 'var(--success-color)', 
                color: 'white', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '1rem', 
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span>Live</span>
              </span>
            </h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Last 24 hours
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {/* Show comp off days information in activity feed */}
              {realEmployees.filter(emp => {
                // In a real implementation, this would check actual attendance records
                // For demo purposes, we'll simulate with a random selection
                const weekendWorkers = [1, 3, 5]; // Employee IDs who worked weekends
                return weekendWorkers.includes(emp.id);
              }).length > 0 && (
                <div className="alert" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderRadius: '0.5rem',
                  border: '1px solid #3b82f6',
                  background: '#eff6ff',
                  color: '#1e40af',
                  padding: '1rem'
                }}>
                  <div>
                    <strong>{realEmployees.filter(emp => {
                      // In a real implementation, this would check actual attendance records
                      // For demo purposes, we'll simulate with a random selection
                      const weekendWorkers = [1, 3, 5]; // Employee IDs who worked weekends
                      return weekendWorkers.includes(emp.id);
                    }).length} employees</strong> eligible for comp off days
                    <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Review weekend/holiday work records
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const compOffEmployees = realEmployees.filter(emp => {
                        const weekendWorkers = [1, 3, 5]; // Employee IDs who worked weekends
                        return weekendWorkers.includes(emp.id);
                      });
                      setSelectedStatusType('compOff');
                      setStatusEmployees(compOffEmployees);
                      setShowStatusModal(true);
                    }}
                    className="btn btn-sm" 
                    style={{ background: '#3b82f6', color: 'white' }}
                  >
                    Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '95%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={24} />
                Advanced Analytics Dashboard
              </h2>
              <button 
                onClick={() => setShowAnalyticsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Analytics Content */}
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* Key Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                      {analyticsData.overallMetrics?.avgAttendance?.toFixed(1)}%
                    </div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Average Attendance</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--success-color)' }}>↗ +2.3% from last month</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning-color)', marginBottom: '0.5rem' }}>
                      {analyticsData.overallMetrics?.avgProductivity?.toFixed(1)}%
                    </div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Average Productivity</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--success-color)' }}>↗ +1.8% from last month</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--info-color)', marginBottom: '0.5rem' }}>
                      {analyticsData.overallMetrics?.totalCompOffDays}
                    </div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Comp Off Days</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--info-color)' }}>Employees eligible for comp off</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success-color)', marginBottom: '0.5rem' }}>
                      {analyticsData.overallMetrics?.employeeSatisfaction}/5
                    </div>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Employee Satisfaction</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--success-color)' }}>↗ +0.2 from last month</div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Weekly Trends Chart */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Weekly Trends</h3>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--primary-color)', borderRadius: '2px' }}></div>
                          <span style={{ fontSize: '0.875rem' }}>Attendance</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--warning-color)', borderRadius: '2px' }}></div>
                          <span style={{ fontSize: '0.875rem' }}>Productivity</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'end', gap: '1rem', height: '200px', padding: '1rem 0' }}>
                      {analyticsData.weeklyTrends?.map((day, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'row', 
                            alignItems: 'end', 
                            gap: '8px', 
                            marginBottom: '0.5rem',
                            height: '140px'
                          }}>
                            {/* Attendance Bar */}
                            <div style={{
                              width: '20px',
                              height: `${(day.attendance / 100) * 120}px`,
                              backgroundColor: 'var(--primary-color)',
                              borderRadius: '4px 4px 0 0',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'end',
                              justifyContent: 'center'
                            }}>
                              <span style={{
                                position: 'absolute',
                                top: '-20px',
                                fontSize: '10px',
                                fontWeight: '600',
                                color: 'var(--primary-color)',
                                whiteSpace: 'nowrap'
                              }}>
                                {day.attendance}%
                              </span>
                            </div>
                            {/* Productivity Bar */}
                            <div style={{
                              width: '20px',
                              height: `${(day.productivity / 100) * 120}px`,
                              backgroundColor: 'var(--warning-color)',
                              borderRadius: '4px 4px 0 0',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'end',
                              justifyContent: 'center'
                            }}>
                              <span style={{
                                position: 'absolute',
                                top: '-20px',
                                fontSize: '10px',
                                fontWeight: '600',
                                color: 'var(--warning-color)',
                                whiteSpace: 'nowrap'
                              }}>
                                {day.productivity}%
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{day.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Leave Analytics */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Leave Analytics</h3>
                  </div>
                  <div className="card-body">
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>This Month</span>
                        <span style={{ fontWeight: '600' }}>{analyticsData.leaveAnalytics?.thisMonth?.total}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Approved: {analyticsData.leaveAnalytics?.thisMonth?.approved} | 
                        Pending: {analyticsData.leaveAnalytics?.thisMonth?.pending} | 
                        Rejected: {analyticsData.leaveAnalytics?.thisMonth?.rejected}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {analyticsData.leaveAnalytics?.types?.map((type, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.875rem' }}>{type.type}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '60px',
                              height: '8px',
                              backgroundColor: 'var(--background-alt)',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${type.percentage}%`,
                                height: '100%',
                                backgroundColor: `hsl(${210 + (index * 30)}, 70%, 50%)`,
                                borderRadius: '4px'
                              }}></div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{type.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Performance */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Department Performance</h3>
                </div>
                <div className="card-body">
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--background-alt)' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Department</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Employees</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Attendance</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Productivity</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.departmentStats?.map((dept, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: '500' }}>{dept.name}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{dept.employees}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{ 
                                color: dept.attendance >= 90 ? 'var(--success-color)' : 
                                       dept.attendance >= 80 ? 'var(--warning-color)' : 'var(--danger-color)'
                              }}>
                                {dept.attendance}%
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{ 
                                color: dept.productivity >= 90 ? 'var(--success-color)' : 
                                       dept.productivity >= 80 ? 'var(--warning-color)' : 'var(--danger-color)'
                              }}>
                                {dept.productivity}%
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '1rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: dept.attendance >= 90 && dept.productivity >= 85 ? 
                                  'var(--success-color-light)' : 'var(--warning-color-light)',
                                color: dept.attendance >= 90 && dept.productivity >= 85 ? 
                                  'var(--success-color)' : 'var(--warning-color)'
                              }}>
                                {dept.attendance >= 90 && dept.productivity >= 85 ? 'Excellent' : 'Good'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={24} />
                System Settings
              </h2>
              <button 
                onClick={() => setShowSettingsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Settings Content */}
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* Company Information */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Company Information</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Company Name</label>
                      <input 
                        type="text" 
                        value={settings.companyName}
                        onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          borderRadius: '0.375rem', 
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'white',
                          color: 'black'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Working Hours Configuration</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Start Time</label>
                      <input 
                        type="time" 
                        value={settings.workingHours.start}
                        onChange={(e) => setSettings({
                          ...settings, 
                          workingHours: {...settings.workingHours, start: e.target.value}
                        })}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          borderRadius: '0.375rem', 
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'white',
                          color: 'black'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>End Time</label>
                      <input 
                        type="time" 
                        value={settings.workingHours.end}
                        onChange={(e) => setSettings({
                          ...settings, 
                          workingHours: {...settings.workingHours, end: e.target.value}
                        })}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          borderRadius: '0.375rem', 
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'white',
                          color: 'black'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Working Days</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={settings.workingDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSettings({...settings, workingDays: [...settings.workingDays, day]});
                              } else {
                                setSettings({...settings, workingDays: settings.workingDays.filter(d => d !== day)});
                              }
                            }}
                          />
                          <span style={{ fontSize: '0.875rem' }}>{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thresholds */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Alert Thresholds</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Overtime Threshold (hours/week)</label>
                      <input 
                        type="number" 
                        value={settings.overtimeThreshold}
                        onChange={(e) => setSettings({...settings, overtimeThreshold: parseInt(e.target.value)})}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          borderRadius: '0.375rem', 
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'white',
                          color: 'black'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Late Threshold (minutes)</label>
                      <input 
                        type="number" 
                        value={settings.lateThreshold}
                        onChange={(e) => setSettings({...settings, lateThreshold: parseInt(e.target.value)})}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          borderRadius: '0.375rem', 
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'white',
                          color: 'black'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Preferences */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">System Preferences</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={settings.autoBackup}
                        onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                      />
                      <span>Enable Automatic Backup</span>
                    </label>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Theme</label>
                      <select 
                        value={settings.theme}
                        onChange={(e) => setSettings({...settings, theme: e.target.value})}
                        style={{ 
                          width: '100%', 
                          padding: '0.5rem', 
                          borderRadius: '0.375rem', 
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'white',
                          color: 'black'
                        }}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // In a real app, you would save settings to backend
                    console.log('Settings saved:', settings);
                    alert('Settings saved successfully!');
                    setShowSettingsModal(false);
                  }}
                  className="btn btn-primary"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Status Detail Modal */}
      {showStatusModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '2rem',
              borderBottom: '1px solid var(--border-color)',
              background: `linear-gradient(135deg, ${
                selectedStatusType === 'active' ? 'var(--success-color), #059669' :
                selectedStatusType === 'absent' ? 'var(--danger-color), #dc2626' :
                selectedStatusType === 'compOff' ? 'var(--info-color), #3b82f6' :
                'var(--warning-color), #d97706'
              })`,
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>
                    {
                      selectedStatusType === 'active' ? '✅ Active Employees Today' :
                      selectedStatusType === 'absent' ? '📋 Employees on Leave / Absent Today' :
                      selectedStatusType === 'compOff' ? '🕒 Employees with Comp Off Days' :
                      '⏰ Late Employees Today'
                    }
                  </h2>
                  <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>
                    {statusEmployees.length} employee{statusEmployees.length !== 1 ? 's' : ''} {
                      selectedStatusType === 'absent' ? 'on leave or absent today' :
                      selectedStatusType === 'compOff' ? 'eligible for comp off days' : 
                      `currently ${selectedStatusType}`
                    }
                  </p>
                </div>
                <button 
                  onClick={() => setShowStatusModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'white',
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Summary Statistics */}
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--primary-color)',
                    marginBottom: '0.25rem'
                  }}>
                    {statusEmployees.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Total {
                      selectedStatusType === 'absent' ? 'On Leave / Absent' :
                      selectedStatusType === 'compOff' ? 'Eligible Employees' :
                      selectedStatusType.charAt(0).toUpperCase() + selectedStatusType.slice(1)
                    }
                  </div>
                </div>
                {selectedStatusType === 'compOff' ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: 'var(--info-color)',
                      marginBottom: '0.25rem'
                    }}>
                      {statusEmployees.length * 1.5} {/* Simulated comp off days */}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Total Comp Off Days
                    </div>
                  </div>
                ) : selectedStatusType === 'absent' ? (
                  <>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--warning-color)',
                        marginBottom: '0.25rem'
                      }}>
                        {statusEmployees.filter(emp => emp.status === 'absent').length}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Currently Absent
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--info-color)',
                        marginBottom: '0.25rem'
                      }}>
                        {statusEmployees.filter(emp => emp.status !== 'absent').length}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        On Approved/Pending Leave
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#8b5cf6',
                        marginBottom: '0.25rem'
                      }}>
                        {((statusEmployees.length / stats.totalEmployees) * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Percentage of Team
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: selectedStatusType === 'active' ? 'var(--success-color)' : 'var(--warning-color)',
                        marginBottom: '0.25rem'
                      }}>
                        {statusEmployees.length > 0 ? 
                          Math.round(statusEmployees.reduce((sum, emp) => sum + emp.productivity, 0) / statusEmployees.length) : 0}%
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Avg Productivity
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#8b5cf6',
                        marginBottom: '0.25rem'
                      }}>
                        {((statusEmployees.length / stats.totalEmployees) * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Percentage of Team
                      </div>
                    </div>
                    {selectedStatusType === 'active' && (
                      <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#06b6d4',
                          marginBottom: '0.25rem'
                        }}>
                          {statusEmployees.filter(emp => emp.hours !== '0:00').length}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          Currently Working
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Employee Cards Grid */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
              {statusEmployees.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {selectedStatusType === 'active' ? '🎉' : 
                     selectedStatusType === 'absent' ? '📋' : 
                     selectedStatusType === 'compOff' ? '🕒' : '⏰'}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {selectedStatusType === 'active' ? 'No active employees' :
                     selectedStatusType === 'absent' ? 'No employees on leave or absent today' :
                     selectedStatusType === 'compOff' ? 'No employees eligible for comp off days' :
                     'No late employees today!'}
                  </h3>
                  <p style={{ margin: 0 }}>
                    {selectedStatusType === 'absent' ? 'All employees are present today! 🎊' :
                     selectedStatusType === 'late' ? 'Everyone arrived on time today! ⭐' :
                     selectedStatusType === 'compOff' ? 'No employees worked on weekends/holidays recently' :
                     'Check back during work hours.'}
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1rem'
                }}>
                  {statusEmployees.map((employee) => (
                    <div key={employee.id} style={{
                      background: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                      e.currentTarget.style.borderColor = selectedStatusType === 'active' ? 'var(--success-color)' :
                                                         selectedStatusType === 'absent' ? 'var(--danger-color)' :
                                                         selectedStatusType === 'compOff' ? 'var(--info-color)' :
                                                         'var(--warning-color)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                    >
                      {/* Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: selectedStatusType === 'active' ? 'var(--success-color)' :
                                   selectedStatusType === 'absent' ? 
                                     (employee.status === 'absent' ? 'var(--danger-color)' : 'var(--info-color)') :
                                   selectedStatusType === 'compOff' ? 'var(--info-color)' :
                                   'var(--warning-color)',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {selectedStatusType === 'compOff' ? 'Comp Off Eligible' : 
                         selectedStatusType === 'absent' ? 
                           (employee.status === 'absent' ? 'Absent Today' : 'On Leave') :
                         selectedStatusType}
                      </div>

                      {/* Employee Info */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${
                            selectedStatusType === 'active' ? 'var(--success-color), #059669' :
                            selectedStatusType === 'absent' ? 
                              (employee.status === 'absent' ? 'var(--danger-color), #dc2626' : 'var(--info-color), #3b82f6') :
                            selectedStatusType === 'compOff' ? 'var(--info-color), #3b82f6' :
                            'var(--warning-color), #d97706'
                          })`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.25rem',
                          flexShrink: 0
                        }}>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, marginBottom: '0.25rem' }}>
                            {employee.name}
                          </h3>
                          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            {employee.department} • {employee.role}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <Mail size={12} />
                            <span>{employee.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Work Details */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'var(--background-alt)',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem'
                      }}>
                        {selectedStatusType === 'compOff' ? (
                          <>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Weekend Work Days</div>
                              <div style={{ fontWeight: '600', color: 'var(--info-color)' }}>
                                Saturday, Sunday
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Comp Off Status</div>
                              <div style={{ fontWeight: '600' }}>Eligible</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hours Worked</div>
                              <div style={{ fontWeight: '600' }}>8.5h avg</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Next Comp Off</div>
                              <div style={{ fontWeight: '600' }}>Pending approval</div>
                            </div>
                          </>
                        ) : selectedStatusType === 'absent' ? (
                          <>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                {employee.status === 'absent' ? 'Absent Status' : 'Leave Type'}
                              </div>
                              <div style={{ fontWeight: '600', color: employee.status === 'absent' ? 'var(--danger-color)' : 'var(--info-color)' }}>
                                {employee.status === 'absent' ? 'Absent Today' : 'Approved Leave'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Leave Dates</div>
                              <div style={{ fontWeight: '600' }}>
                                {employee.status === 'absent' ? 'N/A' : 'Mar 13 - Mar 16, 2024'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Reason</div>
                              <div style={{ fontWeight: '600' }}>
                                {employee.status === 'absent' ? 'Not specified' : 'Family vacation'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Approval Status</div>
                              <div style={{ fontWeight: '600', color: employee.status === 'absent' ? 'var(--danger-color)' : 'var(--info-color)' }}>
                                {employee.status === 'absent' ? 'Not on leave' : 'Approved'}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Check-in Time</div>
                              <div style={{ fontWeight: '600', color: selectedStatusType === 'late' ? 'var(--warning-color)' : 'var(--text-primary)' }}>
                                {employee.checkIn || 'Not checked in'}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Hours Today</div>
                              <div style={{ fontWeight: '600' }}>{employee.hours}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Location</div>
                              <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={12} />
                                {employee.location}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowStatusModal(false);
                            setShowEmployeeModal(true);
                          }}
                          className="btn btn-sm"
                          style={{
                            flex: 1,
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.75rem'
                          }}
                        >
                          <Edit size={12} style={{ marginRight: '0.25rem' }} />
                          Edit Details
                        </button>
                        <button 
                          onClick={() => {
                            // In a real app, this would open a contact modal or initiate communication
                            alert(`Contacting ${employee.name} at ${employee.phone || employee.email}`);
                          }}
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <Phone size={12} style={{ marginRight: '0.25rem' }} />
                          Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Management Modal */}
      {showEmployeeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Employee Management</h2>
              <button 
                onClick={() => setShowEmployeeModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Add Employee Form */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--background-alt)', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Add New Employee</h3>
              <EmployeeForm onSave={handleAddEmployee} onCancel={() => {}} />
            </div>
            
            {/* Employee List */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--background-alt)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Password</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Department</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {realEmployees.map((employee) => (
                    <EmployeeRow 
                      key={employee.id} 
                      employee={employee} 
                      onEdit={handleEmployeeEdit}
                      onDelete={handleEmployeeDelete}
                      onSave={handleEmployeeSave}
                      isEditing={selectedEmployee?.id === employee.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Attendance Modal */}
      {showAttendanceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            width: '95%',
            maxWidth: '1400px',
            maxHeight: '95vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{ 
              padding: '2rem', 
              borderBottom: '1px solid var(--border-color)',
              background: 'linear-gradient(135deg, var(--primary-color), #6366f1)',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>
                    📅 Monthly Attendance Report
                  </h2>
                  <p style={{ margin: 0, opacity: 0.9 }}>
                    {format(new Date(selectedYear, selectedMonth, 1), 'MMMM yyyy')} - Detailed attendance tracking
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {/* View Mode Toggle */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => setViewMode('table')}
                      className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ 
                        background: viewMode === 'table' ? 'white' : 'rgba(255,255,255,0.2)', 
                        color: viewMode === 'table' ? 'var(--primary-color)' : 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.5rem'
                      }}
                    >
                      <BarChart3 size={14} />
                      Table
                    </button>
                    <button 
                      onClick={() => setViewMode('calendar')}
                      className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ 
                        background: viewMode === 'calendar' ? 'white' : 'rgba(255,255,255,0.2)', 
                        color: viewMode === 'calendar' ? 'var(--primary-color)' : 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.5rem'
                      }}
                    >
                      <Calendar size={14} />
                      Calendar
                    </button>
                  </div>
                  <select 
                    value={`${selectedYear}-${selectedMonth}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      handleMonthChange(parseInt(month), parseInt(year));
                    }}
                    style={{ 
                      padding: '0.5rem', 
                      borderRadius: '0.375rem', 
                      border: 'none',
                      fontSize: '0.875rem',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date(selectedYear, i, 1);
                      return (
                        <option key={i} value={`${selectedYear}-${i}`} style={{ color: 'black' }}>
                          {format(date, 'MMMM yyyy')}
                        </option>
                      );
                    })}
                  </select>
                  <button 
                    onClick={() => setShowAttendanceModal(false)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: 'white',
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
              {/* Summary Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem', 
                marginBottom: '2rem' 
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {monthlyAttendance.reduce((sum, emp) => sum + emp.summary.presentDays, 0)}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Present Days</div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {monthlyAttendance.reduce((sum, emp) => sum + emp.summary.leaveDays, 0)}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Leave Days</div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {convertDecimalToHoursMinutes(parseFloat(monthlyAttendance.reduce((sum, emp) => sum + parseFloat(emp.summary.totalHours), 0).toFixed(0)))}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Hours Worked</div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {convertDecimalToHoursMinutes(monthlyAttendance.length > 0 ? 
                      (monthlyAttendance.reduce((sum, emp) => sum + parseFloat(emp.summary.avgHours), 0) / monthlyAttendance.length)
                      : 0)}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Avg Hours/Day</div>
                </div>
              </div>
              
              {/* View Content */}
              {viewMode === 'table' ? (
                /* Table View */
                <div style={{ 
                  overflowX: 'auto',
                  maxWidth: '100%',
                  position: 'relative'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    minWidth: '800px' // Ensure minimum width for proper layout
                  }}>
                    <thead>
                      <tr style={{ background: 'var(--background-alt)' }}>
                        <th style={{ 
                          padding: '1rem', 
                          textAlign: 'left', 
                          borderBottom: '2px solid var(--border-color)',
                          fontWeight: '600',
                          position: 'sticky',
                          left: 0,
                          background: 'var(--background-alt)',
                          zIndex: 1
                        }}>
                          Employee
                        </th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>Present Days</th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>Leave Days</th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>Total Hours</th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>Avg Hours</th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>Attendance Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyAttendance.map((employeeData, index) => (
                        <tr key={employeeData.employee.id} style={{
                          background: index % 2 === 0 ? 'white' : 'var(--background-alt)',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : 'var(--background-alt)'}
                        >
                          <td style={{
                            padding: '1rem',
                            borderBottom: '1px solid var(--border-color)',
                            position: 'sticky',
                            left: 0,
                            background: 'inherit',
                            zIndex: 1
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary-color), #6366f1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.875rem'
                              }}>
                                {employeeData.employee.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                  {employeeData.employee.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  {employeeData.employee.department}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ 
                              background: 'var(--success-color)', 
                              color: 'white', 
                              padding: '0.25rem 0.75rem', 
                              borderRadius: '1rem', 
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}>
                              {employeeData.summary.presentDays}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ 
                              background: employeeData.summary.leaveDays > 0 ? '#3b82f6' : 'var(--text-secondary)', 
                              color: 'white', 
                              padding: '0.25rem 0.75rem', 
                              borderRadius: '1rem', 
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}>
                              {employeeData.summary.leaveDays}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                              {convertDecimalToHoursMinutes(parseFloat(employeeData.summary.totalHours))}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ fontWeight: '600' }}>
                              {convertDecimalToHoursMinutes(parseFloat(employeeData.summary.avgHours))}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              <div style={{
                                width: '60px',
                                height: '8px',
                                background: 'var(--border-color)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${employeeData.summary.attendanceRate}%`,
                                  height: '100%',
                                  background: parseFloat(employeeData.summary.attendanceRate) >= 90 ? 'var(--success-color)' : 
                                             parseFloat(employeeData.summary.attendanceRate) >= 75 ? '#f59e0b' : 'var(--danger-color)',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                              <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                                {employeeData.summary.attendanceRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Calendar View */
                <div style={{ overflowX: 'auto' }}>
                  {monthlyAttendance.map((empData) => (
                    <div key={empData.employee.id} style={{ marginBottom: '2rem' }}>
                      {/* Employee Header */}
                      <div style={{
                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                        padding: '1rem 1.5rem',
                        borderRadius: '0.75rem 0.75rem 0 0',
                        border: '1px solid var(--border-color)',
                        borderBottom: 'none'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
                              {empData.employee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, marginBottom: '0.25rem' }}>
                                {empData.employee.name}
                              </h3>
                              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {empData.employee.department} - {empData.employee.role}
                              </p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
                            <div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success-color)' }}>
                                {empData.summary.presentDays}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Present Days</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--warning-color)' }}>
                                {empData.summary.leaveDays}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Leave Days</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                                {convertDecimalToHoursMinutes(parseFloat(empData.summary.avgHours))}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Hours</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8b5cf6' }}>
                                {empData.summary.attendanceRate}%
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attendance</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Attendance Calendar Grid */}
                      <div style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '0 0 0.75rem 0.75rem',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(7, 1fr)',
                          gap: '1px',
                          background: 'var(--border-color)'
                        }}>
                          {/* Day headers */}
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{
                              background: 'var(--background)',
                              padding: '0.75rem',
                              textAlign: 'center',
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)'
                            }}>
                              {day}
                            </div>
                          ))}
                          
                          {/* Calendar days */}
                          {Array.from({ length: 42 }, (_, i) => {
                            const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
                            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
                            const day = i - firstDay + 1;
                            
                            if (day < 1 || day > daysInMonth) {
                              return (
                                <div key={i} style={{
                                  background: 'var(--background-alt)',
                                  minHeight: '80px'
                                }} />
                              );
                            }
                            
                            const record = empData.attendanceRecords.find(r => r.date === day);
                            const isToday = day === new Date().getDate() && 
                                           selectedMonth === new Date().getMonth() && 
                                           selectedYear === new Date().getFullYear();
                            
                            return (
                              <div key={i} style={{
                                background: 'white',
                                minHeight: '80px',
                                padding: '0.5rem',
                                position: 'relative',
                                border: isToday ? '2px solid var(--primary-color)' : 'none'
                              }}>
                                <div style={{ 
                                  fontSize: '0.875rem', 
                                  fontWeight: isToday ? '700' : '500',
                                  marginBottom: '0.25rem'
                                }}>
                                  {day}
                                </div>
                                {record && (
                                  <div>
                                    <div style={{
                                      fontSize: '0.625rem',
                                      padding: '0.125rem 0.25rem',
                                      borderRadius: '0.25rem',
                                      marginBottom: '0.25rem',
                                      background: 
                                        record.status === 'present' ? '#d1fae5' :
                                        record.status === 'late' ? '#fef3c7' :
                                        record.status === 'absent' ? '#fee2e2' :
                                        record.status === 'leave' ? '#dbeafe' : '#f3f4f6',
                                      color:
                                        record.status === 'present' ? '#065f46' :
                                        record.status === 'late' ? '#92400e' :
                                        record.status === 'absent' ? '#991b1b' :
                                        record.status === 'leave' ? '#1e40af' : '#6b7280'
                                    }}>
                                      {record.status === 'weekend' ? 'OFF' : record.status.toUpperCase()}
                                    </div>
                                    {record.inTime && (
                                      <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)' }}>
                                        In: {record.inTime}
                                      </div>
                                    )}
                                    {record.outTime && (
                                      <div style={{ fontSize: '0.625rem', color: 'var(--text-secondary)' }}>
                                        Out: {record.outTime}
                                      </div>
                                    )}
                                    {record.hoursWorked && record.hoursWorked !== '0' && (
                                      <div style={{ fontSize: '0.625rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                                        {convertDecimalToHoursMinutes(parseFloat(record.hoursWorked))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Employee Form Component
const EmployeeForm = ({ employee = {}, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: employee.name || '',
    email: employee.email || '',
    password: employee.password || '',
    department: employee.department || '',
    role: employee.role || '',
    phone: employee.phone || '',
    location: employee.location || 'Office'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', email: '', password: '', department: '', role: '', phone: '', location: 'Office' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="form-control"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="form-control"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        className="form-control"
      />
      <select
        name="department"
        value={formData.department}
        onChange={handleChange}
        required
        className="form-control"
      >
        <option value="">Select Department</option>
        <option value="Admin">Admin</option>
        <option value="Software">Software</option>
        <option value="Testing">Testing</option>
        <option value="Operations">Operations</option>
        <option value="Design">Design</option>
        <option value="Embedded">Embedded</option>
      </select>
      <input
        type="text"
        name="role"
        placeholder="Role/Position"
        value={formData.role}
        onChange={handleChange}
        required
        className="form-control"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={handleChange}
        className="form-control"
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="submit" className="btn btn-primary">Add Employee</button>
        <button type="button" onClick={onCancel} className="btn btn-outline">Cancel</button>
      </div>
    </form>
  );
};

// Employee Row Component
const EmployeeRow = ({ employee, onEdit, onDelete, onSave, isEditing }) => {
  const [editData, setEditData] = useState(employee);

  const handleSave = () => {
    onSave(editData);
  };

  const handleCancel = () => {
    setEditData(employee);
    onEdit(null);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  if (isEditing) {
    return (
      <tr style={{ backgroundColor: '#fffbeb' }}>
        <td style={{ padding: '1rem' }}>
          <input
            type="text"
            name="name"
            value={editData.name}
            onChange={handleChange}
            className="form-control"
            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
          />
        </td>
        <td style={{ padding: '1rem' }}>
          <input
            type="email"
            name="email"
            value={editData.email}
            onChange={handleChange}
            className="form-control"
            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
          />
        </td>
        <td style={{ padding: '1rem' }}>
          <input
            type="text"
            name="password"
            value={editData.password}
            onChange={handleChange}
            className="form-control"
            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
          />
        </td>
        <td style={{ padding: '1rem' }}>
          <select
            name="department"
            value={editData.department}
            onChange={handleChange}
            className="form-control"
            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
          >
            <option value="Admin">Admin</option>
            <option value="Software">Software</option>
            <option value="Testing">Testing</option>
            <option value="Operations">Operations</option>
            <option value="Design">Design</option>
            <option value="Embedded">Embedded</option>
          </select>
        </td>
        <td style={{ padding: '1rem' }}>
          <input
            type="text"
            name="role"
            value={editData.role}
            onChange={handleChange}
            className="form-control"
            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
          />
        </td>
        <td style={{ padding: '1rem' }}>
          <select
            name="status"
            value={editData.status}
            onChange={handleChange}
            className="form-control"
            style={{ fontSize: '0.875rem', padding: '0.5rem' }}
          >
            <option value="active">Active</option>
            <option value="leave">On Leave</option>
            <option value="late">Late</option>
          </select>
        </td>
        <td style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSave} className="btn btn-sm btn-success">Save</button>
            <button onClick={handleCancel} className="btn btn-sm btn-outline">Cancel</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
      <td style={{ padding: '1rem', fontWeight: '500' }}>{employee.name}</td>
      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{employee.email}</td>
      <td style={{ padding: '1rem' }}>
        <span style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: '#6b7280',
          color: 'white',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          fontFamily: 'monospace'
        }}>
          {employee.password}
        </span>
      </td>
      <td style={{ padding: '1rem' }}>
        <span style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: 'var(--primary-color)',
          color: 'white',
          borderRadius: '0.25rem',
          fontSize: '0.75rem'
        }}>
          {employee.department}
        </span>
      </td>
      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{employee.role}</td>
      <td style={{ padding: '1rem' }}>
        <span className={`badge ${
          employee.status === 'active' ? 'badge-success' :
          employee.status === 'leave' ? 'badge-info' : 'badge-warning'
        }`}>
          {employee.status}
        </span>
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onEdit(employee)} className="btn btn-sm btn-outline">
            <Edit size={14} /> Edit
          </button>
          <button 
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
                onDelete(employee.id);
              }
            }} 
            className="btn btn-sm btn-danger"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default AdminDashboard;