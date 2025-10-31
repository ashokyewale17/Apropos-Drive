import React, { useEffect, useState } from "react";
import { 
  Calendar, Clock, Users, TrendingUp, BarChart3, Download, Filter, 
  Search, ArrowLeft, ArrowRight, Eye, CheckCircle, AlertCircle, 
  Timer, Activity, Target, RefreshCw, ChevronDown, X
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from 'date-fns';

const AttendanceReport = () => {
  const [realEmployees, setRealEmployees] = useState([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState({ employee: null, records: [], title: '' });

  useEffect(() => {
    loadEmployeeData();
  }, []);

  useEffect(() => {
    if (realEmployees.length > 0) {
      generateMonthlyAttendance(realEmployees);
    }
  }, [realEmployees, selectedMonth, selectedYear]);

  const loadEmployeeData = () => {
    // Using the same employee data structure as AdminDashboard
    const employees = [
      {
        id: 1,
        name: 'Tushar Mhaskar',
        email: 'tushar.mhaskar@company.com',
        department: 'Admin',
        role: 'Admin & HR',
        status: 'active',
        joinDate: '2023-01-15',
        phone: '+91-9876543210'
      },
      {
        id: 2,
        name: 'Vijay Solanki',
        email: 'vijay.solanki@company.com',
        department: 'Testing',
        role: 'QA Engineer',
        status: 'active',
        joinDate: '2023-02-20',
        phone: '+91-9876543211'
      },
      {
        id: 3,
        name: 'Pinky Chakrabarty',
        email: 'pinky.chakrabarty@company.com',
        department: 'Operations',
        role: 'Operations Manager',
        status: 'active',
        joinDate: '2023-01-10',
        phone: '+91-9876543212'
      },
      {
        id: 4,
        name: 'Sanket Pawal',
        email: 'sanket.pawal@company.com',
        department: 'Design',
        role: 'UI/UX Designer',
        status: 'active',
        joinDate: '2023-03-05',
        phone: '+91-9876543213'
      },
      {
        id: 5,
        name: 'Ashok Yewale',
        email: 'ashok.yewale@company.com',
        department: 'Software',
        role: 'Software Developer',
        status: 'active',
        joinDate: '2023-02-01',
        phone: '+91-9876543214'
      },
      {
        id: 6,
        name: 'Harshal Lohar',
        email: 'harshal.lohar@company.com',
        department: 'Software',
        role: 'Senior Developer',
        status: 'absent',
        joinDate: '2022-12-15',
        phone: '+91-9876543215'
      },
      {
        id: 7,
        name: 'Prasanna Pandit',
        email: 'prasanna.pandit@company.com',
        department: 'Embedded',
        role: 'Embedded Engineer',
        status: 'late',
        joinDate: '2023-03-20',
        phone: '+91-9876543216'
      }
    ];

    setRealEmployees(employees);
  };

  const generateMonthlyAttendance = (employees) => {
    if (!employees || employees.length === 0) return;
    
    setIsLoading(true);
    
    const monthlyData = employees.map(employee => {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const attendanceRecords = [];
      let presentDays = 0;
      let totalHours = 0;
      let leaveDays = 0;
      let earlyLeaveDays = 0;
      let halfDays = 0;
      let workingDays = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, selectedMonth, day);
        const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
        
        if (!isWeekendDay && date <= new Date()) {
          workingDays++;
          const isOnLeave = Math.random() < 0.05; // 5% leave rate
          const isLate = Math.random() < 0.15; // 15% late rate
          const isEarlyLeave = Math.random() < 0.08; // 8% early leave rate
          const isHalfDay = Math.random() < 0.05; // 5% half day rate
          const isPresent = !isOnLeave && Math.random() > 0.08; // 92% attendance rate
          
          let status = 'present';
          let inTime = '';
          let outTime = '';
          let hoursWorked = 0;
          
          if (isOnLeave) {
            status = 'leave';
            leaveDays++;
          } else if (isHalfDay) {
            status = 'half';
            halfDays++;
            // Half day: 4 hours work
            const baseInHour = 9;
            const inMinutes = Math.floor(Math.random() * 60);
            const outHour = 13;
            const outMinutes = Math.floor(Math.random() * 60);
            
            inTime = `${baseInHour.toString().padStart(2, '0')}:${inMinutes.toString().padStart(2, '0')}`;
            outTime = `${outHour.toString().padStart(2, '0')}:${outMinutes.toString().padStart(2, '0')}`;
            
            const inDate = new Date(date);
            inDate.setHours(baseInHour, inMinutes);
            const outDate = new Date(date);
            outDate.setHours(outHour, outMinutes);
            
            hoursWorked = Math.max(0, (outDate - inDate) / (1000 * 60 * 60));
            totalHours += hoursWorked;
            presentDays++;
          } else if (!isPresent) {
            status = 'absent';
          } else {
            const baseInHour = isLate ? 9 + Math.floor(Math.random() * 2) : 8 + Math.floor(Math.random() * 2);
            const inMinutes = Math.floor(Math.random() * 60);
            
            // Regular day or early leave
            let outHour, outMinutes;
            if (isEarlyLeave) {
              status = 'early';
              earlyLeaveDays++;
              // Early leave: leave 2-4 hours early
              outHour = 14 + Math.floor(Math.random() * 2);
              outMinutes = Math.floor(Math.random() * 60);
            } else {
              // Regular day
              outHour = Math.min(19, baseInHour + 8 + Math.floor(Math.random() * 2));
              outMinutes = Math.floor(Math.random() * 60);
            }
            
            inTime = `${baseInHour.toString().padStart(2, '0')}:${inMinutes.toString().padStart(2, '0')}`;
            outTime = `${outHour.toString().padStart(2, '0')}:${outMinutes.toString().padStart(2, '0')}`;
            
            const inDate = new Date(date);
            inDate.setHours(baseInHour, inMinutes);
            const outDate = new Date(date);
            outDate.setHours(outHour, outMinutes);
            
            hoursWorked = Math.max(0, (outDate - inDate) / (1000 * 60 * 60));
            totalHours += hoursWorked;
            presentDays++;
            
            if (isLate && status !== 'early') {
              status = 'late';
            }
          }
          
          attendanceRecords.push({
            date: day,
            status,
            inTime,
            outTime,
            hoursWorked: hoursWorked.toFixed(1)
          });
        } else if (isWeekendDay) {
          attendanceRecords.push({
            date: day,
            status: 'weekend',
            inTime: '',
            outTime: '',
            hoursWorked: '0'
          });
        }
      }
      
      const avgHours = presentDays > 0 ? (totalHours / presentDays).toFixed(1) : '0.0';
      const attendanceRate = workingDays > 0 ? ((presentDays / workingDays) * 100).toFixed(1) : '0.0';
      
      return {
        employee,
        attendanceRecords,
        summary: {
          presentDays,
          leaveDays,
          earlyLeaveDays,
          halfDays,
          totalHours: totalHours.toFixed(1),
          avgHours,
          attendanceRate
        }
      };
    });
    
    setMonthlyAttendance(monthlyData);
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return '#10b981';
      case 'late': return '#f59e0b';
      case 'absent': return '#ef4444';
      case 'leave': return '#3b82f6';
      case 'early': return '#f59e0b';
      case 'half': return '#8b5cf6';
      case 'weekend': return '#9ca3af';
      default: return '#e5e7eb';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return '✓';
      case 'late': return '⏰';
      case 'absent': return '✗';
      case 'leave': return '🏖️';
      case 'early': return '🚪';
      case 'half': return '🌗';
      case 'weekend': return '🌴';
      default: return '-';
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

  const handleExportReport = () => {
    try {
      // Generate comprehensive report data
      const reportData = generateReportData();
      
      // Create CSV for now (will be Excel-compatible)
      const csvContent = createExcelCompatibleCSV(reportData);
      const filename = `Attendance_Report_${format(new Date(selectedYear, selectedMonth), 'MMM_yyyy')}.csv`;
      
      downloadFile(csvContent, filename, 'text/csv');
      
      // Show success message
      alert(`Report exported successfully!

File: ${filename}

Note: You can open this CSV file in Excel for full functionality.`);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report. Please try again.');
    }
  };

  const generateReportData = () => {
    const monthName = format(new Date(selectedYear, selectedMonth), 'MMMM yyyy');
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    return {
      reportTitle: `Monthly Attendance Report - ${monthName}`,
      summary: {
        totalEmployees: overallStats.totalEmployees,
        avgAttendanceRate: overallStats.avgAttendanceRate,
        totalPresentDays: overallStats.totalPresentDays,
        totalHours: overallStats.totalHours,
        generatedOn: format(new Date(), 'dd/MM/yyyy HH:mm:ss')
      },
      employeeData: filteredAttendance,
      daysInMonth
    };
  };

  const createExcelCompatibleCSV = (reportData) => {
    const rows = [];
    
    // Report Header
    rows.push([reportData.reportTitle]);
    rows.push([`Generated on: ${reportData.summary.generatedOn}`]);
    rows.push(['']); // Empty row
    
    // Summary Section
    rows.push(['SUMMARY']);
    rows.push(['Total Employees', reportData.summary.totalEmployees]);
    rows.push(['Average Attendance Rate', `${reportData.summary.avgAttendanceRate}%`]);
    rows.push(['Total Present Days', reportData.summary.totalPresentDays]);
    rows.push(['Total Hours Worked', reportData.summary.totalHours]);
    rows.push(['']); // Empty row
    
    // Employee Summary Table
    rows.push(['EMPLOYEE SUMMARY']);
    const summaryHeaders = [
      'Employee Name',
      'Department',
      'Role',
      'Present Days',
      'Leave Days',
      'Early Leave Days',
      'Half Days',
      'Total Hours',
      'Average Hours/Day',
      'Attendance Rate (%)'
    ];
    rows.push(summaryHeaders);
    
    // Employee summary data
    reportData.employeeData.forEach(employeeData => {
      rows.push([
        employeeData.employee.name,
        employeeData.employee.department,
        employeeData.employee.role,
        employeeData.summary.presentDays,
        employeeData.summary.leaveDays,
        employeeData.summary.earlyLeaveDays,
        employeeData.summary.halfDays,
        employeeData.summary.totalHours,
        convertDecimalToHoursMinutes(parseFloat(employeeData.summary.avgHours)),
        employeeData.summary.attendanceRate
      ]);
    });
    
    rows.push(['']); // Empty row
    
    // Daily Attendance Details
    rows.push(['DAILY ATTENDANCE DETAILS']);
    
    // Create daily headers
    const dailyHeaders = ['Employee', 'Department'];
    for (let day = 1; day <= reportData.daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const dayName = format(date, 'EEE');
      dailyHeaders.push(`${day} ${dayName}`);
    }
    rows.push(dailyHeaders);
    
    // Add daily data for each employee
    reportData.employeeData.forEach(employeeData => {
      const row = [employeeData.employee.name, employeeData.employee.department];
      
      for (let day = 1; day <= reportData.daysInMonth; day++) {
        const dayRecord = employeeData.attendanceRecords.find(r => r.date === day);
        if (dayRecord) {
          let cellValue = '';
          if (dayRecord.status === 'present' || dayRecord.status === 'late' || dayRecord.status === 'early' || dayRecord.status === 'half') {
            cellValue = `${dayRecord.status.toUpperCase()} (${dayRecord.inTime}-${dayRecord.outTime}) ${convertDecimalToHoursMinutes(parseFloat(dayRecord.hoursWorked))}`;
          } else {
            cellValue = dayRecord.status.toUpperCase();
          }
          row.push(cellValue);
        } else {
          row.push('-');
        }
      }
      
      rows.push(row);
    });
    
    // Convert to CSV format
    return rows.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
  };

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const filteredAttendance = monthlyAttendance.filter(item => {
    const matchesEmployee = selectedEmployee === 'all' || item.employee.id.toString() === selectedEmployee;
    const matchesSearch = item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEmployee && matchesSearch;
  });

  const overallStats = {
    totalEmployees: monthlyAttendance.length,
    avgAttendanceRate: monthlyAttendance.length > 0 ? 
      (monthlyAttendance.reduce((sum, emp) => sum + parseFloat(emp.summary.attendanceRate), 0) / monthlyAttendance.length).toFixed(1) : '0.0',
    totalPresentDays: monthlyAttendance.reduce((sum, emp) => sum + emp.summary.presentDays, 0),
    totalEarlyLeaveDays: monthlyAttendance.reduce((sum, emp) => sum + emp.summary.earlyLeaveDays, 0),
    totalHalfDays: monthlyAttendance.reduce((sum, emp) => sum + emp.summary.halfDays, 0),
    totalHours: monthlyAttendance.reduce((sum, emp) => sum + parseFloat(emp.summary.totalHours), 0).toFixed(1)
  };

  return (
    <div style={{ padding: '2rem', background: 'var(--background-alt)', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, var(--primary-color) 0%, #6366f1 100%)' }}>
        <div className="card-body" style={{ color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>
                📊 Monthly Attendance Report
              </h1>
              <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '1rem' }}>
                Comprehensive attendance tracking for {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}
              </p>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} />
                  <span>{overallStats.totalEmployees} employees</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} />
                  <span>{overallStats.avgAttendanceRate}% avg attendance</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} />
                  <span>{overallStats.totalHours} total hours</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => generateMonthlyAttendance(realEmployees)}
                className="btn" 
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                disabled={isLoading}
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button 
                onClick={handleExportReport}
                className="btn" 
                style={{ background: 'white', color: 'var(--primary-color)' }}
              >
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4" style={{ gap: '1rem', marginBottom: '2rem' }}>
        {/* Stats Cards */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value">{overallStats.totalEmployees}</div>
              <div className="stat-label">
                <Users size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Total Employees
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'var(--primary-color)', borderRadius: '0.5rem' }}>
              <Users size={20} style={{ color: 'white' }} />
            </div>
          </div>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid var(--success-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value" style={{ color: 'var(--success-color)' }}>
                {overallStats.avgAttendanceRate}%
              </div>
              <div className="stat-label">
                <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Avg Attendance
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'var(--success-color)', borderRadius: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'white' }} />
            </div>
          </div>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value" style={{ color: '#f59e0b' }}>
                {overallStats.totalEarlyLeaveDays}
              </div>
              <div className="stat-label">
                <Clock size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Early Leaves
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: '#f59e0b', borderRadius: '0.5rem' }}>
              <Clock size={20} style={{ color: 'white' }} />
            </div>
          </div>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value" style={{ color: '#8b5cf6' }}>
                {overallStats.totalHalfDays}
              </div>
              <div className="stat-label">
                <Timer size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Half Days
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: '#8b5cf6', borderRadius: '0.5rem' }}>
              <Timer size={20} style={{ color: 'white' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Month/Year Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                <select 
                  value={`${selectedYear}-${selectedMonth}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setSelectedMonth(parseInt(month));
                    setSelectedYear(parseInt(year));
                  }}
                  style={{ 
                    padding: '0.5rem', 
                    borderRadius: '0.375rem', 
                    border: '1px solid var(--border-color)', 
                    fontSize: '0.875rem'
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date(selectedYear, i, 1);
                    return (
                      <option key={i} value={`${selectedYear}-${i}`}>
                        {format(date, 'MMMM yyyy')}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {/* Employee Filter */}
              <select 
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              >
                <option value="all">All Employees</option>
                {realEmployees.map(emp => (
                  <option key={emp.id} value={emp.id.toString()}>{emp.name}</option>
                ))}
              </select>
              
              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
                <Search size={16} style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    width: '100%'
                  }}
                />
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
              >
                <Calendar size={14} />
                Calendar
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
              >
                <BarChart3 size={14} />
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <RefreshCw size={48} className="animate-spin" style={{ color: 'var(--primary-color)', margin: '0 auto 1rem' }} />
          <h3>Loading attendance data...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Please wait while we generate the monthly report</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            {viewMode === 'calendar' ? (
              /* Calendar View */
              <div style={{ padding: '1.5rem' }}>
                {filteredAttendance.map((employeeData, empIndex) => (
                  <div key={employeeData.employee.id} style={{ marginBottom: empIndex < filteredAttendance.length - 1 ? '3rem' : '0' }}>
                    {/* Employee Header - Non-clickable */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, var(--background-alt) 0%, #f8fafc 100%)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)'
                    }}>
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
                          {employeeData.employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
                            {employeeData.employee.name}
                          </h3>
                          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            {employeeData.employee.role} • {employeeData.employee.department}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success-color)' }}>
                            {employeeData.summary.presentDays}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Present Days</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                            {convertDecimalToHoursMinutes(parseFloat(employeeData.summary.avgHours))}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Hours</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6' }}>
                            {employeeData.summary.attendanceRate}%
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attendance</div>
                        </div>
                      </div>
                    </div>

                    {/* Calendar Grid - Only individual days are clickable */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '1px',
                      background: 'var(--border-color)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      userSelect: 'none' // Prevent text selection on calendar
                    }}>
                      {/* Day Headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{
                          background: 'var(--background-alt)',
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)'
                        }}>
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {(() => {
                        const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
                        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
                        const days = [];
                        
                        // Empty cells for days before month starts
                        for (let i = 0; i < firstDay; i++) {
                          days.push(
                            <div key={`empty-${i}`} style={{
                              background: '#f8fafc',
                              minHeight: '80px'
                            }} />
                          );
                        }
                        
                        // Days of the month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const dayRecord = employeeData.attendanceRecords.find(r => r.date === day);
                          const isToday = new Date().getDate() === day && 
                                        new Date().getMonth() === selectedMonth && 
                                        new Date().getFullYear() === selectedYear;
                          
                          days.push(
                            <div key={day} style={{
                              background: 'white',
                              minHeight: '80px',
                              padding: '0.5rem',
                              position: 'relative',
                              cursor: dayRecord ? 'pointer' : 'default',
                              transition: 'all 0.2s ease',
                              border: isToday ? '2px solid var(--primary-color)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (dayRecord) {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.transform = 'scale(1.02)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (dayRecord) {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }}
                            onClick={dayRecord ? () => {
                              // Only show details if there's attendance data for this day
                              alert(`${employeeData.employee.name} - ${format(new Date(selectedYear, selectedMonth, day), 'MMM dd, yyyy')}

Status: ${dayRecord.status}
In: ${dayRecord.inTime || 'N/A'}
Out: ${dayRecord.outTime || 'N/A'}
Hours: ${dayRecord.hoursWorked || '0'}h`);
                            } : undefined}
                            >
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '0.5rem'
                              }}>
                                <span style={{
                                  fontWeight: '600',
                                  fontSize: '0.875rem',
                                  color: isToday ? 'var(--primary-color)' : 'var(--text-primary)'
                                }}>
                                  {day}
                                </span>
                                {dayRecord && (
                                  <span style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: getStatusColor(dayRecord.status),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                  }}>
                                    {getStatusIcon(dayRecord.status)}
                                  </span>
                                )}
                              </div>
                              
                              {dayRecord && dayRecord.status !== 'weekend' && (
                                <div style={{ fontSize: '0.75rem' }}>
                                  {dayRecord.inTime && dayRecord.outTime ? (
                                    <>
                                      <div style={{ color: 'var(--success-color)', fontWeight: '500' }}>
                                        In: {dayRecord.inTime}
                                      </div>
                                      <div style={{ color: 'var(--danger-color)', fontWeight: '500' }}>
                                        Out: {dayRecord.outTime}
                                      </div>
                                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        {convertDecimalToHoursMinutes(parseFloat(dayRecord.hoursWorked))}
                                      </div>
                                    </>
                                  ) : (
                                    <div style={{ 
                                      color: dayRecord.status === 'leave' ? '#3b82f6' : 'var(--danger-color)',
                                      fontWeight: '500',
                                      textTransform: 'capitalize'
                                    }}>
                                      {dayRecord.status}
                                    </div>
                                  )}
                                  {/* Click indicator for days with data */}
                                  <div style={{
                                    fontSize: '0.625rem',
                                    color: 'var(--text-secondary)',
                                    marginTop: '0.25rem',
                                    opacity: 0.7
                                  }}>
                                    Click for details
                                  </div>
                                </div>
                              )}
                              
                              {isToday && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: '0.25rem',
                                  right: '0.25rem',
                                  fontSize: '0.625rem',
                                  color: 'var(--primary-color)',
                                  fontWeight: '600'
                                }}>
                                  Today
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        return days;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
                      <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>Early Leave</th>
                      <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>Half Day</th>
                      <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>Total Hours</th>
                      <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>Avg Hours</th>
                      <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontWeight: '600' }}>Attendance Rate</th>
                      <th style={{ 
                        padding: '1rem', 
                        textAlign: 'center', 
                        borderBottom: '2px solid var(--border-color)', 
                        fontWeight: '600',
                        minWidth: '120px',
                        width: '120px'
                      }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((employeeData, index) => (
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
                            fontWeight: '600',
                            cursor: employeeData.summary.presentDays > 0 ? 'pointer' : 'default'
                          }}
                          onClick={() => {
                            if (employeeData.summary.presentDays > 0) {
                              // Find all present days for this employee
                              const presentRecords = employeeData.attendanceRecords
                                .filter(record => record.status === 'present' || record.status === 'late' || record.status === 'early' || record.status === 'half')
                                .sort((a, b) => a.date - b.date);
                              
                              setDetailData({
                                employee: employeeData.employee,
                                records: presentRecords,
                                title: 'Present Days'
                              });
                              setShowDetailModal(true);
                            }
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
                            fontWeight: '600',
                            cursor: employeeData.summary.leaveDays > 0 ? 'pointer' : 'default'
                          }}
                          onClick={() => {
                            if (employeeData.summary.leaveDays > 0) {
                              // Find all leave days for this employee
                              const leaveRecords = employeeData.attendanceRecords
                                .filter(record => record.status === 'leave')
                                .sort((a, b) => a.date - b.date);
                              
                              setDetailData({
                                employee: employeeData.employee,
                                records: leaveRecords,
                                title: 'Leave Days'
                              });
                              setShowDetailModal(true);
                            }
                          }}>
                            {employeeData.summary.leaveDays}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ 
                            background: employeeData.summary.earlyLeaveDays > 0 ? '#f59e0b' : 'var(--text-secondary)', 
                            color: 'white', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '1rem', 
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: employeeData.summary.earlyLeaveDays > 0 ? 'pointer' : 'default'
                          }}
                          onClick={() => {
                            if (employeeData.summary.earlyLeaveDays > 0) {
                              // Find all early leave days for this employee
                              const earlyLeaveRecords = employeeData.attendanceRecords
                                .filter(record => record.status === 'early')
                                .sort((a, b) => a.date - b.date);
                              
                              setDetailData({
                                employee: employeeData.employee,
                                records: earlyLeaveRecords,
                                title: 'Early Leave Days'
                              });
                              setShowDetailModal(true);
                            }
                          }}>
                            {employeeData.summary.earlyLeaveDays}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                          <span style={{ 
                            background: employeeData.summary.halfDays > 0 ? '#8b5cf6' : 'var(--text-secondary)', 
                            color: 'white', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '1rem', 
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: employeeData.summary.halfDays > 0 ? 'pointer' : 'default'
                          }}
                          onClick={() => {
                            if (employeeData.summary.halfDays > 0) {
                              // Find all half days for this employee
                              const halfDayRecords = employeeData.attendanceRecords
                                .filter(record => record.status === 'half')
                                .sort((a, b) => a.date - b.date);
                              
                              setDetailData({
                                employee: employeeData.employee,
                                records: halfDayRecords,
                                title: 'Half Days'
                              });
                              setShowDetailModal(true);
                            }
                          }}>
                            {employeeData.summary.halfDays}
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
                        <td style={{ 
                          padding: '1rem', 
                          textAlign: 'center', 
                          borderBottom: '1px solid var(--border-color)',
                          minWidth: '120px',
                          width: '120px'
                        }}>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedEmployee(employeeData.employee.id.toString());
                            }}
                            className="btn btn-sm btn-outline"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              background: 'white',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--primary-color)';
                              e.target.style.color = 'white';
                              e.target.style.borderColor = 'var(--primary-color)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'white';
                              e.target.style.color = 'var(--text-secondary)';
                              e.target.style.borderColor = 'var(--border-color)';
                            }}
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-body" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>Status Legend</h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: getStatusColor('present')
              }} />
              <span>Present</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: getStatusColor('late')
              }} />
              <span>Late</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: getStatusColor('early')
              }} />
              <span>Early Leave</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: getStatusColor('half')
              }} />
              <span>Half Day</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: getStatusColor('absent')
              }} />
              <span>Absent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: getStatusColor('leave')
              }} />
              <span>On Leave</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: getStatusColor('weekend')
              }} />
              <span>Weekend</span>
            </div>
          </div>
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
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <div className="card" style={{
            maxWidth: '900px',
            width: '95%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div className="card-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, #6366f1 100%)',
              color: 'white'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
                  {detailData.title}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', opacity: 0.9 }}>
                  {detailData.employee?.name} • {detailData.records.length} records
                </p>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'white',
                  padding: '0.5rem',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Summary Section */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--background-alt)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Employee</div>
                    <div style={{ fontWeight: '600' }}>{detailData.employee?.name}</div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: getStatusColor(detailData.title === 'Early Leave Days' ? 'early' : 'half'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Records</div>
                    <div style={{ fontWeight: '600' }}>{detailData.records.length}</div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'var(--success-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Month</div>
                    <div style={{ fontWeight: '600' }}>{format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-body" style={{
              padding: 0,
              overflowY: 'auto',
              flex: 1
            }}>
              {detailData.records.length > 0 ? (
                <div style={{ padding: '1.5rem' }}>
                  <div style={{
                    display: 'grid',
                    gap: '1rem'
                  }}>
                    {detailData.records.map((record, index) => {
                      const dateStr = format(new Date(selectedYear, selectedMonth, record.date), 'EEE, MMM dd, yyyy');
                      return (
                        <div key={index} className="card" style={{
                          borderLeft: `4px solid ${getStatusColor(record.status)}`,
                          marginBottom: '0.5rem',
                          borderRadius: '8px',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.2s ease',
                          background: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                        }}
                        >
                          <div className="card-body" style={{ padding: '1.25rem' }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '1rem'
                            }}>
                              <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                {dateStr}
                              </h4>
                              <span style={{
                                padding: '0.375rem 0.875rem',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                background: `${getStatusColor(record.status)}20`,
                                color: getStatusColor(record.status),
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                <div style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: getStatusColor(record.status)
                                }}></div>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </div>
                            
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                              gap: '1rem',
                              marginBottom: '0.5rem'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                background: 'var(--background-alt)',
                                borderRadius: '8px'
                              }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: 'var(--success-color)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white'
                                }}>
                                  <CheckCircle size={18} />
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.125rem' }}>Check-in</div>
                                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{record.inTime || '--:--'}</div>
                                </div>
                              </div>
                              
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                background: 'var(--background-alt)',
                                borderRadius: '8px'
                              }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: 'var(--danger-color)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white'
                                }}>
                                  <AlertCircle size={18} />
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.125rem' }}>Check-out</div>
                                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{record.outTime || '--:--'}</div>
                                </div>
                              </div>
                              
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                background: 'var(--background-alt)',
                                borderRadius: '8px'
                              }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: 'var(--primary-color)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white'
                                }}>
                                  <Clock size={18} />
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.125rem' }}>Hours Worked</div>
                                  <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{record.hoursWorked || '0'}h</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <Activity size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.5, color: 'var(--text-secondary)' }} />
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    No Records Found
                  </h3>
                  <p style={{ margin: 0, fontSize: '1.125rem' }}>
                    There are no {detailData.title.toLowerCase()} records for this employee in {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}.
                  </p>
                </div>
              )}
            </div>
            
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="btn"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#4f46e5';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--primary-color)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <X size={18} />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;
