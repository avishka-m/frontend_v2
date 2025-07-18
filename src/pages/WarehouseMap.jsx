import React from 'react';
import WarehouseMap from '../components/warehouse/WarehouseMap';

const WarehouseMapPage = () => {
  const handleLocationSelect = (location) => {
    console.log('Selected location:', location);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Warehouse Map</h1>
      <WarehouseMap onLocationSelect={handleLocationSelect} />
    </div>
  );
};

export default WarehouseMapPage;