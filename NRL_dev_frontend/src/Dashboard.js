// src/Dashboard.js
import React from 'react';
import Chart from './Chart'; // Assuming you have a Chart component


const Dashboard = () => {  

  return (
    <div>
      <div>
        
        <Chart type="points" /> {/* Pass props as needed */}
        <Chart type="average" />
        <Chart type="positionHLF" />
      </div>
    </div>
  );
};

export default Dashboard;