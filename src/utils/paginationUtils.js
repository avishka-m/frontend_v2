/**
 * Pagination utility functions
 */

/**
 * Load all items from a paginated API endpoint
 * @param {Function} apiFunction - The API function to call (should return data array)
 * @param {Object} baseParams - Base parameters to include in each request
 * @param {number} maxLimit - Maximum limit allowed per request (default 100)
 * @returns {Promise<Array>} - Promise that resolves to array of all items
 */
export const loadAllPaginatedItems = async (apiFunction, baseParams = {}, maxLimit = 100) => {
  let allItems = [];
  let skip = 0;
  const limit = maxLimit;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await apiFunction({ ...baseParams, limit, skip });
      
      if (response && response.length > 0) {
        allItems = [...allItems, ...response];
        skip += limit;
        // If we got fewer items than requested, we've reached the end
        hasMore = response.length === limit;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error('Error in pagination:', error);
      // Break the loop on error to avoid infinite loops
      hasMore = false;
      throw error; // Re-throw to let caller handle the error
    }
  }

  return allItems;
};

/**
 * Load paginated items with progress callback
 * @param {Function} apiFunction - The API function to call
 * @param {Object} baseParams - Base parameters to include in each request
 * @param {Function} onProgress - Callback function called with (loadedCount, hasMore)
 * @param {number} maxLimit - Maximum limit allowed per request (default 100)
 * @returns {Promise<Array>} - Promise that resolves to array of all items
 */
export const loadAllPaginatedItemsWithProgress = async (
  apiFunction, 
  baseParams = {}, 
  onProgress = null, 
  maxLimit = 100
) => {
  let allItems = [];
  let skip = 0;
  const limit = maxLimit;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await apiFunction({ ...baseParams, limit, skip });
      
      if (response && response.length > 0) {
        allItems = [...allItems, ...response];
        skip += limit;
        hasMore = response.length === limit;
        
        // Call progress callback if provided
        if (onProgress) {
          onProgress(allItems.length, hasMore);
        }
      } else {
        hasMore = false;
        if (onProgress) {
          onProgress(allItems.length, false);
        }
      }
    } catch (error) {
      console.error('Error in pagination:', error);
      hasMore = false;
      throw error;
    }
  }

  return allItems;
};
