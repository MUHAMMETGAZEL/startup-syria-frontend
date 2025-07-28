let licenseActive = false;
const licenseInput = document.getElementById('license-input');
const licenseBtn = document.getElementById('license-btn');
const licenseStatus = document.getElementById('license-status');

  
  licenseStatus.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> جاري التحقق من الترخيص...</span>';
  /*
  async function activateLicense() {
    const enteredKey = licenseInput.value.trim();
    
    if (!enteredKey) {
        showNotification('خطأ في الإدخال', 'يرجى إدخال مفتاح الترخيص');
        return;
    }
   
    licenseStatus.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> جاري التحقق من الترخيص...</span>';
    
    try {
        const { token } = await ApiClient.login(enteredKey);
        localStorage.setItem('token', token);
        licenseActive = true;
        licenseInput.value = '';
        showNotification('تم التفعيل بنجاح!', 'تم تفعيل الترخيص بنجاح');
    } catch (error) {
        licenseActive = false;
        
       
        let errorMessage = 'فشل في الاتصال بالخادم';
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'تعذر الاتصال بالخادم. تأكد من تشغيل الخادم الخلفي';
        } else {
            errorMessage = error.message || 'مفتاح الترخيص غير صحيح';
        }
        
        showNotification('خطأ في الترخيص', errorMessage);
    }
    
    updateLicenseUI();
}
*/


aasync function activateLicense() {
  const enteredKey = licenseInput.value.trim();

  if (!enteredKey) {
    showNotification('خطأ في الإدخال', 'يرجى إدخال مفتاح الترخيص');
    return;
  }

  licenseStatus.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> جاري التحقق من الترخيص...</span>';

  try {
    // إرسال الطلب مع تضمين الكوكي
    const response = await fetch('https://startup-syria-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ⚠️ ضروري لإرسال واستلام الكوكي
      body: JSON.stringify({ licenseKey: enteredKey })
    });

    if (!response.ok) {
      throw new Error('مفتاح الترخيص غير صالح');
    }

    // بعد نجاح تسجيل الدخول، نتحقق من صلاحية الترخيص
    const isAdmin = await verifyAdmin();

    if (isAdmin) {
      licenseActive = true;
      licenseInput.value = '';
      showNotification('تم التفعيل بنجاح', 'تم تفعيل الترخيص بنجاح');
    } else {
      throw new Error('ليس لديك صلاحية الوصول كمسؤول');
    }

  } catch (error) {
    licenseActive = false;
    showNotification('فشل التفعيل', error.message);
  }

  updateLicenseUI(); // ✅ تحديث الواجهة
}



function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    return true; 
  }
}




function loadLicenseStatus() {
  const token = localStorage.getItem('token');
  if (token && !isTokenExpired(token)) {
    licenseActive = true;
  } else {
    localStorage.removeItem('token');
    licenseActive = false;
  }
  updateLicenseUI();
}
function loadTokenState() {
    const token = localStorage.getItem('token');
    licenseActive = !!token;
    updateLicenseUI();
  }

  async function initApp() {
    loadTokenState(); // 
  
  }

async function verifyAdmin() {
  try {
    const response = await fetch('https://startup-syria-backend.onrender.com/api/auth/verify', {
      credentials: 'include' // ⚠️ ضروري لقراءة الكوكي
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isAdmin === true;
  } catch (error) {
    console.error('فشل التحقق من صلاحيات المسؤول:', error);
    return false;
  }
}

function updateLicenseUI() {
  const licenseControl = document.querySelector('.license-control');

  if (licenseActive) {
    licenseStatus.innerHTML = '<span class="license-active"><i class="fas fa-check-circle"></i> الترخيص مفعل</span>';
    licenseControl.style.display = 'none';

    document.getElementById('add-section').style.display = 'flex';
    document.getElementById('edit-section').style.display = 'flex';
    document.getElementById('view-suggestions').style.display = 'flex';
    document.getElementById('suggest-company').style.display = 'flex';
  } else {
    licenseStatus.innerHTML = '<span class="license-inactive"><i class="fas fa-times-circle"></i> الترخيص غير مفعل</span>';
    licenseControl.style.display = 'flex';

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












