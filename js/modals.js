function setupModalListeners() {
    // نافذة إضافة قسم جديد
    document.getElementById('add-section').addEventListener('click', function() {
      if (!licenseActive) {
        showNotification('خطأ في الترخيص', 'يجب تفعيل الترخيص أولاً');
        return;
      }
      if (!activeSection) {
        showNotification('خطأ', 'يجب اختيار قسم فرعي أولاً');
        return;
      }
      document.getElementById('add-section-modal').classList.add('active');
      document.getElementById('new-section-name').value = '';
      document.getElementById('section-link').value = '';
      document.getElementById('new-section-name').focus();
    });
    
    document.getElementById('close-add-modal').addEventListener('click', function() {
      document.getElementById('add-section-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-add-btn').addEventListener('click', function() {
      document.getElementById('add-section-modal').classList.remove('active');
    });
    
    document.getElementById('confirm-add-btn').addEventListener('click', async function() {
      const newName = document.getElementById('new-section-name').value.trim();
      const newLink = document.getElementById('section-link').value.trim();
      if (newName) {
        if (!sectionDatabase[activeSection]) {
          sectionDatabase[activeSection] = {
            sectionNames: [],
            sectionLinks: [],
            sectorColor: "#4ca1af"
          };
        }
        sectionDatabase[activeSection].sectionNames.push(newName);
        sectionDatabase[activeSection].sectionLinks.push(newLink);
        if (activeSection) {
          const sectorColor = sectionDatabase[activeSection].sectorColor;
          const saved = await saveData();
          if (saved) {
            createNewCircleMap(activeSection, sectorColor);
            showNotification('تمت الإضافة بنجاح!', `تم إضافة قسم جديد باسم: ${newName}`);
          } else {
            showNotification('خطأ في الحفظ', 'فشل في حفظ القسم الجديد');
          }
        }
        document.getElementById('add-section-modal').classList.remove('active');
      } else {
        alert('الرجاء إدخال اسم للقسم الجديد');
      }
    });
    
    // نافذة تعديل الأقسام
    document.getElementById('edit-section').addEventListener('click', function() {
      if (!licenseActive) {
        showNotification('خطأ في الترخيص', 'يجب تفعيل الترخيص أولاً');
        return;
      }
      if (!activeSection) {
        showNotification('خطأ', 'يجب اختيار قسم فرعي أولاً');
        return;
      }
      updateSectionList();
      document.getElementById('edit-section-modal').classList.add('active');
      document.getElementById('edit-section-content').value = '';
      document.getElementById('edit-section-link').value = '';
      document.querySelectorAll('.section-item').forEach(item => {
        item.classList.remove('active');
      });
    });
    
    document.getElementById('close-edit-modal').addEventListener('click', function() {
      document.getElementById('edit-section-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-edit-btn').addEventListener('click', function() {
      document.getElementById('edit-section-modal').classList.remove('active');
    });
    
    document.getElementById('confirm-edit-btn').addEventListener('click', async function() {
      const selectedItem = document.querySelector('.section-item.active');
      const newName = document.getElementById('edit-section-content').value.trim();
      const newLink = document.getElementById('edit-section-link').value.trim();
      if (!selectedItem) {
        alert('الرجاء تحديد قسم للتعديل');
        return;
      }
      if (!newName) {
        alert('الرجاء إدخال اسم جديد للقسم');
        return;
      }
      const sectionId = parseInt(selectedItem.dataset.id);
      sectionDatabase[activeSection].sectionNames[sectionId] = newName;
      sectionDatabase[activeSection].sectionLinks[sectionId] = newLink;
      if (activeSection) {
        const sectorColor = sectionDatabase[activeSection].sectorColor;
        const saved = await saveData();
        if (saved) {
          createNewCircleMap(activeSection, sectorColor);
          showNotification('تم التعديل بنجاح!', `تم تحديث القسم رقم ${sectionId + 1} بنجاح`);
        } else {
          showNotification('خطأ في الحفظ', 'فشل في حفظ التعديلات');
        }
      }
      document.getElementById('edit-section-modal').classList.remove('active');
    });
    
    // نافذة اقتراحات الشركات
    document.getElementById('suggest-company').addEventListener('click', function() {
      document.getElementById('suggest-company-modal').classList.add('active');
      document.getElementById('company-name').value = '';
      document.getElementById('company-field').value = '';
      document.getElementById('company-description').value = '';
      document.getElementById('company-location').value = '';
      document.getElementById('company-website').value = '';
      document.getElementById('company-name').focus();
    });
    
    document.getElementById('close-suggest-modal').addEventListener('click', function() {
      document.getElementById('suggest-company-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-suggest-btn').addEventListener('click', function() {
      document.getElementById('suggest-company-modal').classList.remove('active');
    });
    
    // نافذة عرض الاقتراحات
    document.getElementById('view-suggestions').addEventListener('click', function() {
      document.getElementById('suggestions-modal').classList.add('active');
      loadSuggestions();
    });
    
    document.getElementById('close-suggestions-modal').addEventListener('click', function() {
      document.getElementById('suggestions-modal').classList.remove('active');
    });
    
    document.getElementById('close-suggestions-btn').addEventListener('click', function() {
      document.getElementById('suggestions-modal').classList.remove('active');
    });
    
    // معالجة تقديم نموذج الاقتراح
    document.querySelector('.suggestion-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const companyData = {
        name: document.getElementById('company-name').value,
        field: document.getElementById('company-field').value,
        description: document.getElementById('company-description').value,
        location: document.getElementById('company-location').value,
        website: document.getElementById('company-website').value || '',
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      if (!companyData.name || !companyData.field || !companyData.description || !companyData.location) {
        showNotification('خطأ في الإدخال', 'الرجاء تعبئة جميع الحقول المطلوبة');
        return;
      }
      
      const submitBtn = document.querySelector('.suggestion-form .submit-btn');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
      submitBtn.disabled = true;
      
      try {
        await ApiClient.submitSuggestion(companyData);
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        showNotification('شكراً لك!', 'تم استلام اقتراحك بنجاح وسيتم دراسته من قبل فريقنا');
        document.getElementById('suggest-company-modal').classList.remove('active');
      } catch (error) {
        console.error("Error saving suggestion: ", error);
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        showNotification('خطأ في النظام', 'فشل في إرسال الاقتراح، يرجى المحاولة لاحقاً');
      }
    });
  }
  
  // تحديث قائمة الأقسام
  function updateSectionList() {
    const sectionList = document.getElementById('section-list');
    sectionList.innerHTML = '';
    if (!activeSection) return;
    const sectionNames = sectionDatabase[activeSection].sectionNames;
    const sectionLinks = sectionDatabase[activeSection].sectionLinks;
    sectionNames.forEach((name, index) => {
      const sectionItem = document.createElement('div');
      sectionItem.className = 'section-item';
      sectionItem.dataset.id = index;
      sectionItem.innerHTML = `
        <div>
          <span class="section-name">${name}</span>
          ${sectionLinks[index] ? 
            `<span class="section-link"><i class="fas fa-link link-icon"></i> ${sectionLinks[index]}</span>` : 
            ''}
        </div>
        <span class="section-id">${index + 1}</span>
      `;
      sectionItem.addEventListener('click', function() {
        document.querySelectorAll('.section-item').forEach(item => {
          item.classList.remove('active');
        });
        this.classList.add('active');
        document.getElementById('edit-section-content').value = name;
        document.getElementById('edit-section-link').value = sectionLinks[index] || '';
      });
      sectionList.appendChild(sectionItem);
    });
  }
  
  // تحميل الاقتراحات
  async function loadSuggestions() {
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '<div class="loading-suggestions"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الاقتراحات...</div>';
    
    try {

      const data = await ApiClient.getSuggestions();
     /* console.log("🚀 بيانات الاقتراحات:", data);*/
      if (!data || Object.keys(data).length === 0) {
        suggestionsList.innerHTML = `
          <div class="no-suggestions">
            <i class="fas fa-inbox"></i>
            <p>لا توجد اقتراحات متاحة حالياً</p>
          </div>
        `;
        return;
      }

      suggestionsList.innerHTML = '';
      Object.entries(data).forEach(([id, suggestion]) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
        <h4>${suggestion.name}</h4>
    <p><strong>المجال:</strong> ${suggestion.field}</p>
    <p><strong>الوصف:</strong> ${suggestion.description}</p>
    <p><strong>الموقع:</strong> ${suggestion.location}</p>
    <p><strong>الحالة:</strong> ${suggestion.status}</p>
    ${suggestion.website ? `<p><a href="${suggestion.website}" target="_blank">رابط</a></p>` : ''}
    <p style="font-size: 0.8rem; color: gray;">${new Date(suggestion.timestamp).toLocaleString('ar-SY')}</p>
    
    
    <div class="suggestion-actions">
          <button class="action-btn approve" title="موافقة" data-id="${id}">✔</button>
          <button class="action-btn reject" title="رفض" data-id="${id}">✖</button>
          <button class="action-btn delete" title="حذف" data-id="${id}">🗑</button>
        </div>
  
    `;
  suggestionsList.appendChild(item);
});
 // أحداث الأزرار
 document.querySelectorAll('.action-btn.approve').forEach(btn => {
  btn.addEventListener('click', async () => {
    await ApiClient.updateSuggestionStatus(btn.dataset.id, 'approved');
    loadSuggestions();
  });
});

document.querySelectorAll('.action-btn.reject').forEach(btn => {
  btn.addEventListener('click', async () => {
    await ApiClient.updateSuggestionStatus(btn.dataset.id, 'rejected');
    loadSuggestions();
  });
});

document.querySelectorAll('.action-btn.delete').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (confirm('هل أنت متأكد من حذف هذا الاقتراح؟')) {
      await ApiClient.deleteSuggestion(btn.dataset.id);
      loadSuggestions();
    }
  });
});


    } catch (error) {
      console.error("❌ Error loading suggestions: ", error);
      suggestionsList.innerHTML = `
        <div class="error-loading">
          <i class="fas fa-exclamation-triangle"></i>
          <p>فشل في تحميل الاقتراحات</p>
          <p>${error.message}</p>
        </div>
      `;
    }
  }