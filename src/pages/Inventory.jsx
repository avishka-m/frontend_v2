import { Package, Plus, Search, Filter } from 'lucide-react';

const Inventory = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <Package className="w-8 h-8 text-primary-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Product {item}</h3>
                  <p className="text-sm text-gray-500">SKU: PRD-{item.toString().padStart(3, '0')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <span className="text-sm font-medium">{Math.floor(Math.random() * 100) + 10}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm font-medium">A{item}-B2-C1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    item % 3 === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item % 3 === 0 ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
