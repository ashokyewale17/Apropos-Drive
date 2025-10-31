// Test script to verify our ObjectId handling fix
const mongoose = require('mongoose');

console.log('Testing ObjectId handling...');

// Test cases
const testCases = [
  '5', // Simple number string
  '507f1f77bcf86cd799439011', // Valid ObjectId string
  'employee-123', // Custom string ID
  'abc123def456abc123def456', // 24-char hex string (looks like ObjectId but isn't valid)
];

testCases.forEach((testCase, index) => {
  console.log(`\nTest case ${index + 1}: "${testCase}"`);
  
  // Check if it's a valid ObjectId
  const isValidObjectId = mongoose.Types.ObjectId.isValid(testCase);
  console.log('  Is valid ObjectId:', isValidObjectId);
  
  // Try to create an ObjectId
  if (isValidObjectId) {
    try {
      const objectId = new mongoose.Types.ObjectId(testCase);
      console.log('  Created ObjectId successfully:', objectId.toString());
    } catch (error) {
      console.log('  Failed to create ObjectId:', error.message);
    }
  } else {
    console.log('  Not a valid ObjectId, would use as string');
  }
});

console.log('\nTest completed.');
