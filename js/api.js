const ApiClient = {
    baseUrl: 'https://startup-syria-backend.onrender.com/api', 
  async request(endpoint, method = 'GET', data = null, requiresAuth = false) {
      const BASE_URL = 'https://startup-syria-backend.onrender.com/api';
      const fullUrl = this.baseUrl + endpoint;
      const headers = {};
      const options = {
          method,
          headers,
          credentials: 'same-origin'

      };
      
      if (data) {
          headers['Content-Type'] = 'application/json';
          options.body = JSON.stringify(data);
      }
      
      if (requiresAuth) {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('لم يتم العثور على رمز التخويل');
          headers['Authorization'] = `Bearer ${token}`;
      }
      
      try {
          const response = await fetch(fullUrl, options);
          
         
          if (response.status === 401) {
              licenseActive = false;
              updateLicenseUI();
              throw new Error('انتهت صلاحية الجلسة، يرجى إعادة التفعيل');
          }
          
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'طلب فاشل');
          }
          
          return response.json();
      } catch (error) {
          console.error(`خطأ في الطلب ${method} إلى ${fullUrl}:`, error);
          throw error;
      }
  },
  

getSuggestions() {
    return this.request('${BASE_URL}/suggestions', 'GET', null, true); // يجب أن يكون true هنا
  },
  /*
  async request(endpoint, method = 'GET', data = null, requiresAuth = false) {
    const fullUrl = this.baseUrl + endpoint;
    const headers = {};
    const options = {
      method,
      headers,
      credentials: 'same-origin'
    };
  
    if (data) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
  
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('لم يتم العثور على رمز التخويل');
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    try {
      const response = await fetch(fullUrl, options);
  
      if (response.status === 401) {
        licenseActive = false;
        updateLicenseUI();
        throw new Error('انتهت صلاحية الجلسة، يرجى إعادة التفعيل');
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'طلب فاشل');
      }
  
      return response.json();
    } catch (error) {
      console.error(`خطأ في الطلب ${method} إلى ${fullUrl}:`, error);
      throw error;
    }
  }
  
,
*/
  
  updateSuggestionStatus(id, newStatus) {
    return this.request(`${BASE_URL}/suggestions/${id}/status`, 'PUT', { status: newStatus }, true);
  },
  
  deleteSuggestion(id) {
    return this.request(`${BASE_URL}/suggestions/${id}`, 'DELETE', null, true);
  },

  login(licenseKey) {
      return this.request('${BASE_URL}/auth/login', 'POST', { licenseKey });
  },
  
  getData() {
      return this.request(${BASE_URL}'/data', 'GET');
  },
  
  saveData(data) {
      return this.request(${BASE_URL}'/data', 'POST', data, true);
  },
  
  submitSuggestion(suggestion) {
      return this.request('${BASE_URL}/suggestions', 'POST', suggestion);
  },



};









