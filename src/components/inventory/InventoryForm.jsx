import { Field, ErrorMessage } from 'formik';

const InventoryForm = ({ locations, categories, isSubmitting }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* SKU */}
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
            SKU*
          </label>
          <Field
            type="text"
            name="sku"
            id="sku"
            placeholder="Enter SKU code"
            className="form-control"
            disabled={isSubmitting}
          />
          <ErrorMessage name="sku" component="div" className="form-error" />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name*
          </label>
          <Field
            type="text"
            name="name"
            id="name"
            placeholder="Enter item name"
            className="form-control"
            disabled={isSubmitting}
          />
          <ErrorMessage name="name" component="div" className="form-error" />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category*
          </label>
          <Field
            as="select"
            name="category"
            id="category"
            className="form-control"
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Field>
          <ErrorMessage name="category" component="div" className="form-error" />
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity*
          </label>
          <Field
            type="number"
            name="quantity"
            id="quantity"
            min="0"
            className="form-control"
            disabled={isSubmitting}
          />
          <ErrorMessage name="quantity" component="div" className="form-error" />
        </div>

        {/* Unit Price */}
        <div>
          <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-1">
            Unit Price ($)*
          </label>
          <Field
            type="number"
            name="unit_price"
            id="unit_price"
            min="0"
            step="0.01"
            className="form-control"
            disabled={isSubmitting}
          />
          <ErrorMessage name="unit_price" component="div" className="form-error" />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location_id" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <Field
            as="select"
            name="location_id"
            id="location_id"
            className="form-control"
            disabled={isSubmitting}
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name || location.code}
              </option>
            ))}
          </Field>
          <ErrorMessage name="location_id" component="div" className="form-error" />
        </div>
      </div>

      {/* Advanced Settings Section */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Advanced Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Min Stock Level */}
          <div>
            <label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Stock Level
            </label>
            <Field
              type="number"
              name="min_stock_level"
              id="min_stock_level"
              min="0"
              className="form-control"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              System will alert when stock falls below this level
            </p>
            <ErrorMessage name="min_stock_level" component="div" className="form-error" />
          </div>

          {/* Max Stock Level */}
          <div>
            <label htmlFor="max_stock_level" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Stock Level
            </label>
            <Field
              type="number"
              name="max_stock_level"
              id="max_stock_level"
              min="0"
              className="form-control"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum recommended quantity to keep in stock
            </p>
            <ErrorMessage name="max_stock_level" component="div" className="form-error" />
          </div>

          {/* Supplier ID - Can be enhanced with supplier selection */}
          <div>
            <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-1">
              Supplier ID
            </label>
            <Field
              type="text"
              name="supplier_id"
              id="supplier_id"
              className="form-control"
              disabled={isSubmitting}
            />
            <ErrorMessage name="supplier_id" component="div" className="form-error" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Field
          as="textarea"
          name="description"
          id="description"
          rows="3"
          className="form-control w-full"
          placeholder="Enter item description"
          disabled={isSubmitting}
        />
        <ErrorMessage name="description" component="div" className="form-error" />
      </div>
    </>
  );
};

export default InventoryForm;