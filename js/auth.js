let licenseActive = false;
const licenseInput = document.getElementById('license-input');
const licenseBtn = document.getElementById('license-btn');
const licenseStatus = document.getElementById('license-status');

  
  licenseStatus.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> جاري التحقق من الترخيص...</span>';
  
  async function activateLicense() {
  const enteredKey = licenseInput.value.trim();
  
  try {
    const response = await fetch(${ApiClient.baseUrl}/auth/login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: enteredKey }),
      credentials: 'include' // مهم لإرسال/استقبال الكوكيز
    });

    if (!response.ok) {
      throw new Error('مفتاح الترخيص غير صحيح');
    }

    licenseActive = true;
    showNotification('تم التفعيل بنجاح!', 'تم تفعيل الترخيص بنجاح');
  } catch (error) {
    licenseActive = false;
    showNotification('خطأ في الترخيص', error.message || 'فشل في الاتصال');
  }
  
  updateLicenseUI();
}

/*function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    return true; 
  }
}

*/


/*function loadLicenseStatus() {
  const token = localStorage.getItem('token');
  if (token && !isTokenExpired(token)) {
    licenseActive = true;
  } else {
    localStorage.removeItem('token');
    licenseActive = false;
  }
  updateLicenseUI();
}*/
/*function loadTokenState() {
    const token = localStorage.getItem('token');
    licenseActive = !!token;
    updateLicenseUI();
  }

  async function initApp() {
    loadTokenState(); // 
  
  }
*/

function updateLicenseUI() {
  if (licenseActive) {
  licenseStatus.innerHTML = '<span class="license-active"><i class="fas fa-check-circle"></i> الترخيص مفعل</span>';
    document.getElementById('add-section').style.display = 'flex';
    document.getElementById('edit-section').style.display = 'flex';
    document.getElementById('view-suggestions').style.display = 'flex';
    document.getElementById('suggest-company').style.display = 'flex';
  } else {
      licenseStatus.innerHTML = '<span class="license-inactive"><i class="fas fa-times-circle"></i> الترخيص غير مفعل</span>';
    document.getElementById('add-section').style.display = 'none';
    document.getElementById('edit-section').style.display = 'none';
    document.getElementById('view-suggestions').style.display = 'none';
    document.getElementById('suggest-company').style.display = 'flex';
  }
}


function setupLicenseListeners() {
  licenseBtn.addEventListener('click', activateLicense);
}

loadLicenseStatus();












