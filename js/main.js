// متغيرات عامة
let sectionDatabase = {};
const sectionCount = 8;
const lastSaveTimeElement = document.getElementById('last-save-time');
let activeSection = null;
let rotationAngle = 0;
let nestingLevel = 0;
const MAX_NESTING_LEVEL = 1;

// تهيئة التطبيق
async function initApp() {
  // تحميل حالة الترخيص
  loadLicenseStatus();
  
  // تحميل البيانات
  await loadData();
  
  // إعداد تحديثات الوقت الحقيقي
  setupRealtimeUpdates();
  
  // إعداد واجهة المستخدم
  updateLicenseUI();
  initMap();
  
  // إعداد مستمعات الأحداث
  setupEventListeners();
  
  // حفظ دوري للبيانات
  setInterval(() => {
    if (Object.keys(sectionDatabase).length > 0) {
      saveDataLocally();
    }
  }, 30000);
}


async function loadData() {
  try {
    // ✅ دائماً حمّل من الخادم
    const data = await ApiClient.getData();
    sectionDatabase = data || {};
    ensureAllSectionsExist();
    saveDataLocally();

    // ✅ تحديث الوقت الظاهر للمستخدم
    const now = new Date();
    lastSaveTimeElement.textContent = now.toLocaleTimeString('ar-SA');

    return true;
  } catch (error) {
    console.error('❌ خطأ في تحميل البيانات من الخادم:', error);

    // ✅ في حال فشل التحميل، استخدم البيانات المحلية
    try {
      const localData = localStorage.getItem('innovationMapData');
      if (localData) {
        const parsedData = JSON.parse(localData);
        sectionDatabase = parsedData.data || parsedData;
        ensureAllSectionsExist();

        if (parsedData.timestamp) {
          const saveDate = new Date(parsedData.timestamp);
          lastSaveTimeElement.textContent = saveDate.toLocaleTimeString('ar-SA');
        }
        return true;
      }
    } catch (parseError) {
      console.error('❌ خطأ في تحليل البيانات المحلية:', parseError);
    }

    // إذا فشل كل شيء، استخدم قاعدة بيانات فارغة
    await initializeDatabase();
    return false;
  }
}















// تأكد من وجود جميع الأقسام في قاعدة البيانات
function ensureAllSectionsExist() {
  let hasChanges = false;
  sectors.forEach(sector => {
    sector.subsections.forEach(subsection => {
      if (!sectionDatabase[subsection]) {
        sectionDatabase[subsection] = {
          sectionNames: Array.from({length: sectionCount}, (_, i) => `القسم ${i+1}`),
          sectionLinks: Array(sectionCount).fill(''),
          sectorColor: sector.color
        };
        hasChanges = true;
      }
    });
  });
  
  if (hasChanges) {
    saveData();
  }
}

// حفظ البيانات محلياً
function saveDataLocally() {
  try {
    const dataToSave = {
      data: sectionDatabase,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem('innovationMapData', JSON.stringify(dataToSave));
    updateLastSaveTime();
    return true;
  } catch (error) {
    console.error('خطأ في الحفظ المحلي:', error);
    return false;
  }
}

// حفظ البيانات في الخادم و localStorage
async function saveData() {
  try {
    const localSaved = saveDataLocally();
    
    try {
      await ApiClient.saveData(sectionDatabase);
      return true;
    } catch (error) {
      console.error('خطأ في الحفظ في الخادم:', error);
      if (localSaved) {
        showNotification('تم الحفظ محلياً', 'تم حفظ البيانات في التخزين المحلي فقط');
        return true;
      }
      return false;
    }
  } catch (error) {
    console.error("خطأ عام في حفظ البيانات:", error);
    return false;
  }
}

// تهيئة قاعدة البيانات
async function initializeDatabase() {
  sectors.forEach(sector => {
    sector.subsections.forEach(subsection => {
      sectionDatabase[subsection] = {
        sectionNames: Array.from({length: sectionCount}, (_, i) => `القسم ${i+1}`),
        sectionLinks: Array(sectionCount).fill(''),
        sectorColor: sector.color
      };
    });
  });
  await saveData();
}

// إعداد تحديثات الوقت الحقيقي
function setupRealtimeUpdates() {
  setInterval(async () => {
      const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const newData = await ApiClient.getData();
      if (JSON.stringify(newData) !== JSON.stringify(sectionDatabase)) {
        sectionDatabase = newData;
        
        if (activeSection) {
          const sectorColor = sectionDatabase[activeSection]?.sectorColor || "#4ca1af";
          createNewCircleMap(activeSection, sectorColor);
        } else {
          drawMap();
        }
        
        saveDataLocally();
      }
    } catch (error) {
      console.error('خطأ في التحديثات الفورية:', error);
    }
  }, 30000);
}

// إعداد مستمعات الأحداث
function setupEventListeners() {
  // مركز الخريطة
  document.querySelector('.center-circle').addEventListener('click', transitionBackToMain);
  
  // أزرار التحكم
  document.getElementById('reset-view').addEventListener('click', transitionBackToMain);
  document.getElementById('rotate-left').addEventListener('click', () => rotateMap(-1));
  document.getElementById('rotate-right').addEventListener('click', () => rotateMap(1));
  
  // الترخيص
  setupLicenseListeners();
  
  // النوافذ المنبثقة
  setupModalListeners();
  
  // حفظ قبل إغلاق النافذة
  window.addEventListener('beforeunload', saveDataLocally);
}

// وظيفة تحديث وقت الحفظ الأخير
function updateLastSaveTime() {
  const now = new Date();
  document.getElementById('last-save-time').textContent = now.toLocaleTimeString('ar-SA');
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);