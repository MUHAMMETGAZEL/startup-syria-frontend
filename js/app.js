
const database = firebase.database();

// متغيرات عامة
let sectionDatabase = {};
let activeSection = null;
let rotationAngle = 0;
let nestingLevel = 0;
let licenseActive = false;
const sectionCount = 8;
const MAX_NESTING_LEVEL = 1;

// عناصر DOM
const licenseInput = document.getElementById('license-input');
const licenseBtn = document.getElementById('license-btn');
const licenseStatus = document.getElementById('license-status');
const lastSaveTimeElement = document.getElementById('last-save-time');
const width = 800;
const height = 800;
const centerX = width / 2;
const centerY = height / 2;
let svg = null;

// الحلقات في الدائرة الرئيسية
const rings = [
    { id: 1, innerRadius: 50, outerRadius: 150, name: "الحلقة الداخلية", color: "rgba(76, 161, 175, 0.3)" },
    { id: 2, innerRadius: 150, outerRadius: 350, name: "الحلقة الخارجية", color: "rgba(255, 126, 95, 0.3)" }
];

// القطاعات الرئيسية
const sectors = [
    { 
        id: 1, 
        name: "Ideation Support", 
        color: "#008080", 
        startAngle: 0, 
        endAngle: 2*Math.PI/5, 
        subsections: [
            "Incubators",
            "Venture Studios",
            "Competition Events",
            "Mentorship Programs",
            "Academic Institutions",
            "Academic Institutions",
            "Talent Development"
        ]
    },
    { 
        id: 2, 
        name: "Operation, Growth, and Markets", 
        color: "#ff6600", 
        startAngle: 2*Math.PI/5, 
        endAngle: 4*Math.PI/5, 
        subsections: [
            "Co-working Spaces",
            "Research and Development Labs",
            "Startup Hiring",
            "Startup Accounting",
            "Startup Marketing",
            "Women's Support"
        ]
    },
    { 
        id: 3, 
        name: "Regulations and Government Support", 
        color: "#ffdd33", 
        startAngle: 4*Math.PI/5, 
        endAngle: 6*Math.PI/5, 
        subsections: [
            "Governmental Support",
            "Legal Support",
            "Banks"
        ]
    },
    { 
        id: 4, 
        name: "Networking and Cultures", 
        color: "#cc3366", 
        startAngle: 6*Math.PI/5, 
        endAngle: 8*Math.PI/5, 
        subsections: [
            "Media Support",
            "Events Orgnizer",
            "NGOs",
            "Startup Podcasts",
            "Prize Giver" 
        ]
    },
    { 
        id: 5, 
        name: "Funding", 
        color: "#0066cc", 
        startAngle: 8*Math.PI/5, 
        endAngle: 2*Math.PI, 
        subsections: [
            "Financial Development Institutions",
            "TVenture Capitals",
            "Private Equity",
            "Angel Investors",
            "Crowdfunding",
            "Family Offices",
            "Fund of Funds"
        ]
    }
];

// تهيئة الخريطة
function initMap() {
    svg = d3.select("#concentric-map")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    
    drawMap();
}

// رسم الخريطة الرئيسية
function drawMap() {
    if (!svg) return;
    
    svg.selectAll("*").remove();
    
    // حساب إجمالي عدد الأقسام الفرعية
    let totalLeaves = 0;
    sectors.forEach(sector => {
        sector.subsections.forEach(subsection => {
            if (sectionDatabase[subsection]) {
                totalLeaves += sectionDatabase[subsection].sectionNames.length;
            }
        });
    });
    
    rings.forEach(ring => {
        sectors.forEach(sector => {
            const startAngle = sector.startAngle + rotationAngle;
            const endAngle = sector.endAngle + rotationAngle;
            if (ring.id === 2) {
                const sectorAngleRange = endAngle - startAngle;
                const subsectionAngle = sectorAngleRange / sector.subsections.length;
                for (let i = 0; i < sector.subsections.length; i++) {
                    const subsectionName = sector.subsections[i];
                    
                    // حساب النسبة المئوية
                    let n = 0;
                    if (sectionDatabase[subsectionName]) {
                        n = sectionDatabase[subsectionName].sectionNames.length;
                    }
                    const percentage = totalLeaves > 0 ? (n / totalLeaves) * 100 : 0;
                    const percentageText = percentage.toFixed(1) + '%';
                    
                    const subsectionStartAngle = startAngle + i * subsectionAngle;
                    const subsectionEndAngle = subsectionStartAngle + subsectionAngle;
                    const arcGenerator = d3.arc()
                        .innerRadius(ring.innerRadius)
                        .outerRadius(ring.outerRadius)
                        .startAngle(subsectionStartAngle)
                        .endAngle(subsectionEndAngle);
                    const path = svg.append("path")
                        .attr("d", arcGenerator())
                        .attr("transform", `translate(${centerX}, ${centerY})`)
                        .attr("fill", sector.color)
                        .attr("stroke", "white")
                        .attr("stroke-width", 1)
                        .attr("opacity", 0.8)
                        .attr("class", "subsection")
                        .attr("data-sector", sector.id)
                        .attr("data-subsection", i)
                        .on("mouseover", function() {
                            d3.select(this).attr("opacity", 1);
                        })
                        .on("mouseout", function() {
                            d3.select(this).attr("opacity", 0.8);
                        });
                    if (nestingLevel === 0) {
                        path.on("click", function() {
                            nestingLevel++;  
                            const sectorColor = sector.color;
                            createNewCircleMap(subsectionName, sectorColor);
                        });
                    }
                    const middleAngle = subsectionStartAngle + subsectionAngle / 2;
                    const textRadius = (ring.innerRadius + ring.outerRadius) / 2;
                    const correctedAngle = middleAngle + 4.728;
                    const x = centerX + textRadius * Math.cos(correctedAngle);
                    const y = centerY + textRadius * Math.sin(correctedAngle);
                    let rotation = (middleAngle * 180 / Math.PI) + 93;
                    if (rotation > 90 && rotation < 270) {
                        rotation += 180;
                    }
                    const g = svg.append("g")
                        .attr("transform", `translate(${x}, ${y}) rotate(${rotation})`)
                        .attr("class", "subsection-label");
                    
                    // بناء نص التسمية مع النسبة المئوية
                    const maxCharsPerLine = 20;
                    let lines = [];
                    
                    // إضافة اسم القسم الفرعي
                    if (subsectionName.length > maxCharsPerLine) {
                        const words = subsectionName.split(' ');
                        let line = "";
                        words.forEach(word => {
                            if ((line + word).length <= maxCharsPerLine) {
                                line += (line ? " " : "") + word;
                            } else {
                                lines.push(line);
                                line = word;
                            }
                        });
                        if (line) lines.push(line);
                    } else {
                        lines = [subsectionName];
                    }
                    
                    // إضافة النسبة المئوية
                    lines.push(percentageText);
                    
                    const lineHeight = 12;
                    const startY = -((lines.length - 1) * lineHeight) / 2;
                    lines.forEach((line, index) => {
                        g.append("text")
                            .attr("x", 0)
                            .attr("y", startY + index * lineHeight)
                            .attr("text-anchor", "middle")
                            .attr("dy", "0.35em")
                            .attr("fill", "#ffffff")
                            .attr("font-size", "10px")
                            .attr("font-weight", "bold")
                            .text(line);
                    });
                }
            } else {
                const arcGenerator = d3.arc()
                    .innerRadius(ring.innerRadius)
                    .outerRadius(ring.outerRadius)
                    .startAngle(startAngle)
                    .endAngle(endAngle);
                const path = svg.append("path")
                    .attr("d", arcGenerator())
                    .attr("transform", `translate(${centerX}, ${centerY})`)
                    .attr("fill", sector.color)
                    .attr("stroke", "white")
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.8)
                    .attr("class", "sector")
                    .attr("data-sector", sector.id)
                    .on("mouseover", function() {
                        d3.select(this).attr("opacity", 1);
                    })
                    .on("mouseout", function() {
                        d3.select(this).attr("opacity", 0.8);
                    });
            }
        });
    });
    
    const innerLabels = [
        { 
            lines: ["Regulations and", "Government Support"], 
            color: "#ffff",
            angle: Math.PI * 0.5 + rotationAngle
        },
        { 
            lines: ["Ideation Support"],
            color: "#ffff",
            angle: Math.PI * 1.7 + rotationAngle
        },
        { 
            lines: ["Networking and", "Cultures"],
            color: "#ffff",
            angle: Math.PI * 0.9 + rotationAngle
        },
        { 
            lines: ["Operation, Growth", "and Markets"],
            color: "#ffff",
            angle: Math.PI * 0.1 + rotationAngle
        },
        { 
            lines: ["Funding"],
            color: "#ffff",
            angle: Math.PI * 3.3 + rotationAngle
        }
    ];
    
    const innerRadius = 100;
    innerLabels.forEach((label) => {
        const x = centerX + innerRadius * Math.cos(label.angle);
        const y = centerY + innerRadius * Math.sin(label.angle);
        let rotation = (label.angle * 180 / Math.PI) + 90;
        if (rotation > 90 && rotation < 270) {
            rotation += 180;
        }
        const g = svg.append("g")
            .attr("transform", `translate(${x}, ${y}) rotate(${rotation})`)
            .attr("class", "inner-label");               

        const lineHeight = 15;
        const startY = -((label.lines.length - 1) * lineHeight) / 2;
        label.lines.forEach((line, i) => {
            if (line === "Funding") {
                g.append("text")
                    .attr("x", 0)
                    .attr("y", startY + i * lineHeight - 4)
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .attr("fill", label.color)
                    .attr("font-size", "15px")
                    .attr("font-weight", "bold")
                    .text(line);
            } else {
                g.append("text")
                    .attr("x", 0)
                    .attr("y", startY + i * lineHeight)
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .attr("fill", label.color)
                    .attr("font-size", "13px")
                    .attr("font-weight", "bold")
                    .text(line);
            }
        });
    });
}

// إنشاء خريطة جديدة للقسم الفرعي
function createNewCircleMap(subsectionName, sectorColor) {
    const transitionOverlay = document.getElementById('transition-overlay');
    const concentricMap = document.getElementById('concentric-map');
    
    // تطبيق تأثير التصغير على الخريطة الحالية
    concentricMap.classList.add('zoom-out');
    
    // الانتظار حتى يكتمل تأثير التصغير
    setTimeout(() => {
        // إزالة الخريطة الحالية
        if (svg) {
            svg.selectAll("*").remove();
        }
        
        // تحديث مركز الدائرة
        document.querySelector('.center-circle').innerHTML = `
            <h3>${subsectionName}</h3>
        `;
        
        // تطبيق تأثير التكبير للخريطة الجديدة
        concentricMap.classList.remove('zoom-out');
        concentricMap.classList.add('zoom-in');
        
        // إنشاء الخريطة الفرعية الجديدة
        const currentData = sectionDatabase[subsectionName];    
        if (!currentData) {
            const parentSector = sectors.find(sector => 
                sector.subsections.includes(subsectionName)
            );
            sectionDatabase[subsectionName] = {
                sectionNames: Array.from({length: sectionCount}, (_, i) => `القسم ${i+1}`),
                sectionLinks: Array(sectionCount).fill(''),
                sectorColor: parentSector ? parentSector.color : "#4ca1af"
            }; 
            saveData();
        }
        
        const sectionNames = sectionDatabase[subsectionName].sectionNames;
        const sectionLinks = sectionDatabase[subsectionName].sectionLinks;
        
        // تحديد عدد الحلقات المطلوبة بناءً على عدد الأقسام
        const baseSectionsPerRing = 20;
        let remainingSections = sectionNames.length;
        let dynamicRingCounts = [];
        let currentRing = 0;

        while (remainingSections > 0) {
            const sectionsThisRing = baseSectionsPerRing + currentRing * 60;
            dynamicRingCounts.push(sectionsThisRing);
            remainingSections -= sectionsThisRing;
            currentRing++;
        }
        const ringThickness = 350;
                
        // إنشاء الحلقات
        let sectionIndexGlobal = 0;

        for (let ringIndex = 0; ringIndex < dynamicRingCounts.length; ringIndex++) {
            const sectionsInThisRing = dynamicRingCounts[ringIndex];

            const startIndex = sectionIndexGlobal;
            const endIndex = Math.min(startIndex + sectionsInThisRing, sectionNames.length);
            const actualSections = endIndex - startIndex;

            if (actualSections === 0) break;
            sectionIndexGlobal += actualSections;

            const ringInnerRadius = 75 + ringIndex * 140;
            const ringOuterRadius = ringInnerRadius + 140;

            if (ringIndex > 0) {
                // رسم حلقة التحديد
                svg.append("circle")
                    .attr("cx", centerX)
                    .attr("cy", centerY)
                    .attr("r", ringOuterRadius + 5)
                    .attr("fill", "none")
                    .attr("stroke", "#ffd166")
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "5,5")
                    .attr("class", "ring-highlight")
                    .attr("opacity", 0.7);
                
                svg.append("text")
                    .attr("x", centerX)
                    .attr("y", centerY - ringOuterRadius - 15)
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .attr("fill", "#ffd166")
                    .attr("font-size", "14px")
                    .attr("font-weight", "bold")
                    .attr("class", "ring-label")
                    .text(`الحلقة ${ringIndex + 1}`);
            }

            const sectorAngle = (2 * Math.PI) / actualSections;

            for (let i = 0; i < actualSections; i++) {
                const sectionIndex = startIndex + i;
                const startAngle = i * sectorAngle;
                const endAngle = (i + 1) * sectorAngle;
                
                const arcGenerator = d3.arc()
                    .innerRadius(ringInnerRadius)
                    .outerRadius(ringOuterRadius)
                    .startAngle(startAngle)
                    .endAngle(endAngle);
                
                const path = svg.append("path")
                    .attr("d", arcGenerator())
                    .attr("transform", `translate(${centerX}, ${centerY})`)
                    .attr("fill", sectorColor)
                    .attr("stroke", "white")
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.8)
                    .attr("class", "subsection-item")
                    .attr("data-section", sectionIndex)
                    .on("mouseover", function() {
                        d3.select(this).attr("opacity", 1);
                    })
                    .on("mouseout", function() {
                        d3.select(this).attr("opacity", 0.8);
                    });
                
                if (sectionLinks[sectionIndex]) {
                    path.on("click", function() {
                        window.open(sectionLinks[sectionIndex], '_blank');
                    });
                }
        
                const middleAngle = startAngle + sectorAngle / 2;
                const textRadius = ringInnerRadius + (ringOuterRadius - ringInnerRadius) / 2;
                const correctedAngle = middleAngle + 4.728;
                const x = centerX + textRadius * Math.cos(correctedAngle);
                const y = centerY + textRadius * Math.sin(correctedAngle);
                
                let rotation = (middleAngle * 180 / Math.PI) + 90;
                if (rotation > 90 && rotation < 270) {
                    rotation += 180;
                }
                
                const g = svg.append("g")
                    .attr("transform", `translate(${x}, ${y}) rotate(${rotation})`)
                    .attr("class", "subsection-label");
                
                const text = g.append("text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .attr("font-size", ringIndex > 0 ? "8px" : "9px")
                    .attr("font-weight", "bold")
                    .text(sectionNames[sectionIndex]);
                
                if (sectionLinks[sectionIndex]) {
                    text.attr("fill", "#ffd166")
                        .attr("class", "clickable-text")
                        .on("click", function() {
                            window.open(sectionLinks[sectionIndex], '_blank');
                        });
                } else {
                    text.attr("fill", "#ffffff");
                }
            }
        }
        
        svg.append("circle")
            .attr("cx", centerX)
            .attr("cy", centerY)
            .attr("r", 50)
            .attr("fill", "none")
            .attr("stroke", "rgba(255, 255, 255, 0.2)")
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 1);
        
        activeSection = subsectionName;
        
        // إخفاء شاشة الانتقال بعد انتهاء التأثير
        setTimeout(() => {
            concentricMap.classList.remove('zoom-in');
            transitionOverlay.classList.remove('active');
        }, 500);
    }, 400);
}

// العودة إلى الخريطة الرئيسية
function transitionBackToMain() {
    const transitionOverlay = document.getElementById('transition-overlay');
    const concentricMap = document.getElementById('concentric-map');
    
    // تطبيق تأثير التصغير على الخريطة الحالية
    concentricMap.classList.add('zoom-out');
    
    // الانتظار حتى يكتمل تأثير التصغير
    setTimeout(() => {
        // إزالة الخريطة الحالية
        if (svg) {
            svg.selectAll("*").remove();
        }
        
        // تحديث مركز الدائرة
        document.querySelector('.center-circle').innerHTML = `
            <h3>سوريا</h3>
            <p>المركز الرئيسي</p>
        `;
        
        // تطبيق تأثير التكبير للخريطة الرئيسية
        concentricMap.classList.remove('zoom-out');
        concentricMap.classList.add('zoom-in');
        
        // إنشاء الخريطة الرئيسية
        nestingLevel = 0;
        rotationAngle = 0;
        drawMap();
        document.getElementById('rotation-controls').style.display = 'flex';
        activeSection = null;
        
        // إخفاء شاشة الانتقال بعد انتهاء التأثير
        setTimeout(() => {
            concentricMap.classList.remove('zoom-in');
            transitionOverlay.classList.remove('active');
        }, 500);
    }, 800);
}

// تدوير الخريطة
function rotateMap(direction) {
    rotationAngle += direction * Math.PI/4;
    drawMap();
}

// وظيفة لعرض الإشعارات
function showNotification(title, message) {
    const notification = document.getElementById('notification');
    const titleElement = document.getElementById('notification-title');
    const messageElement = document.getElementById('notification-message');
    titleElement.textContent = title;
    messageElement.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// تحديث وقت آخر حفظ
function updateLastSaveTime() {
    const now = new Date();
    document.getElementById('last-save-time').textContent = now.toLocaleTimeString('ar-SA');
}

// تحميل حالة الترخيص من localStorage
function loadLicenseStatus() {
    const savedLicense = localStorage.getItem('innovationMapLicense');
    if (savedLicense) {
        try {
            const licenseData = JSON.parse(savedLicense);
            licenseActive = licenseData.active || false;
        } catch (error) {
            console.error('Error loading license status:', error);
            licenseActive = false;
        }
    }
    updateLicenseUI();
}

// حفظ حالة الترخيص في localStorage
function saveLicenseStatus() {
    try {
        const licenseData = {
            active: licenseActive,
            timestamp: Date.now()
        };
        localStorage.setItem('innovationMapLicense', JSON.stringify(licenseData));
    } catch (error) {
        console.error('Error saving license status:', error);
    }
}

// تحديث واجهة الترخيص
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
        document.getElementById('suggest-company').style.display = 'none';
    }
}



// تفعيل الترخيص
async function activateLicense() {
    const enteredKey = licenseInput.value.trim();
    
    if (!enteredKey) {
        showNotification('خطأ في الإدخال', 'يرجى إدخال مفتاح الترخيص');
        return;
    }
    
    // إظهار رسالة تحميل
    licenseStatus.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> جاري التحقق من الترخيص...</span>';
    
    try {
        const isValid = await verifyLicenseKey(enteredKey);
        
        if (isValid) {
            licenseActive = true;
            saveLicenseStatus();
            licenseInput.value = '';
            showNotification('تم التفعيل بنجاح!', 'تم تفعيل الترخيص بنجاح');
        } else {
            licenseActive = false;
            showNotification('خطأ في الترخيص', 'مفتاح الترخيص غير صحيح');
        }
    } catch (error) {
        console.error("License verification error:", error);
        licenseActive = false;
        showNotification('خطأ في النظام', 'فشل التحقق من الترخيص، يرجى المحاولة لاحقاً');
    }
    
    updateLicenseUI();
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
function loadSuggestions() {
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '<div class="loading-suggestions"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الاقتراحات...</div>';
    
    const suggestionsRef = database.ref('suggestions');
    suggestionsRef.once('value')
        .then((snapshot) => {
            suggestionsList.innerHTML = '';
            const suggestionsData = snapshot.val();
            
            if (!suggestionsData) {
                suggestionsList.innerHTML = `
                    <div class="no-suggestions">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>لا توجد اقتراحات متاحة حالياً</p>
                        <p>كن أول من يقترح شركة جديدة!</p>
                    </div>
                `;
                return;
            }
            
            const suggestions = [];
            snapshot.forEach((childSnapshot) => {
                const suggestion = childSnapshot.val();
                suggestion.id = childSnapshot.key; // إضافة المعرف الفريد
                suggestions.push(suggestion);
            });
            
            // ترتيب الاقتراحات من الأحدث إلى الأقدم
            suggestions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            suggestions.forEach((suggestion) => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.dataset.id = suggestion.id;
                
                // تنسيق تاريخ الاقتراح
                const date = new Date(suggestion.timestamp);
                const formattedDate = date.toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                suggestionItem.innerHTML = `
                    <div class="suggestion-header">
                        <div class="suggestion-title">${suggestion.name}</div>
                        <div class="suggestion-field">${suggestion.field}</div>
                    </div>
                    
                    <div class="suggestion-content">
                        <div class="suggestion-detail">
                            <span class="suggestion-label">الوصف:</span>
                            <span class="suggestion-value">${suggestion.description}</span>
                        </div>
                        
                        <div class="suggestion-detail">
                            <span class="suggestion-label">الموقع:</span>
                            <span class="suggestion-value">${suggestion.location}</span>
                        </div>
                        
                        ${suggestion.website ? `
                        <div class="suggestion-detail">
                            <span class="suggestion-label">الموقع الإلكتروني:</span>
                            <a href="${suggestion.website}" target="_blank" class="suggestion-value suggestion-website">
                                ${suggestion.website}
                            </a>
                        </div>
                        ` : ''}
                        
                        <div class="suggestion-status status-${suggestion.status || 'pending'}">
                            <i class="fas fa-${suggestion.status === 'approved' ? 'check-circle' : 
                              suggestion.status === 'rejected' ? 'times-circle' : 'clock'}"></i>
                            ${suggestion.status === 'approved' ? 'تمت الموافقة' : 
                              suggestion.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </div>
                        
                        <div class="suggestion-date">
                            <i class="far fa-clock"></i> ${formattedDate}
                        </div>
                    </div>
                `;
                
                suggestionsList.appendChild(suggestionItem);
            });
        })
        .catch((error) => {
            console.error("Error loading suggestions: ", error);
            suggestionsList.innerHTML = `
                <div class="error-loading">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>فشل في تحميل الاقتراحات</p>
                    <p>${error.message}</p>
                </div>
            `;
        });
}










function isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (e) {
      return true; // أي خطأ يعني أن التوكن غير صالح
    }
  }
  
  function loadTokenState() {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      licenseActive = true;
    } else {
      localStorage.removeItem('token');
      licenseActive = false;
    }
    updateLicenseUI();
  }
  














// الاستماع للتحديثات في الوقت الحقيقي للاقتراحات
function setupSuggestionsRealtime() {
    try {
        const suggestionsRef = database.ref('suggestions');
        suggestionsRef.on('value', (snapshot) => {
            // إذا كانت نافذة الاقتراحات مفتوحة، قم بتحديث القائمة
            if (document.getElementById('suggestions-modal').classList.contains('active')) {
                loadSuggestions();
            }
        });
    } catch (error) {
        console.error('Error setting up realtime suggestions:', error);
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

// حفظ البيانات في Firebase و localStorage
async function saveData() {
    try {
        const localSaved = saveDataLocally();
        try {/*
            await database.ref('innovationMapData').set(sectionDatabase);
 */         await ApiClient.saveData(sectionDatabase);

           return true;
        } catch (firebaseError) {
            console.error("خطأ في حفظ البيانات في Firebase:", firebaseError);
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
function initializeDatabase() {
    sectors.forEach(sector => {
        sector.subsections.forEach(subsection => {
            sectionDatabase[subsection] = {
                sectionNames: Array.from({length: sectionCount}, (_, i) => `القسم ${i+1}`),
                sectionLinks: Array(sectionCount).fill(''),
                sectorColor: sector.color
            };
        });
    });
    saveData();
}

// إعداد تحديثات الوقت الحقيقي
function setupRealtimeUpdates() {
    setInterval(async () => {
        try {
          const newData = await ApiClient.getData();
          if (JSON.stringify(newData) !== JSON.stringify(sectionDatabase)) {
            sectionDatabase = newData;
            ensureAllSectionsExist();
      
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

// تهيئة التطبيق
async function initApp() {
    // تحميل حالة الترخيص
    loadLicenseStatus();
    
    // تحميل البيانات
    await loadData();
    
    // إعداد تحديثات الوقت الحقيقي
    setupRealtimeUpdates();
    
    // إعداد تحديثات الاقتراحات في الوقت الحقيقي
    setupSuggestionsRealtime();
    
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

// تحميل البيانات
async function loadData() {
    try {
        const localData = localStorage.getItem('innovationMapData');
        if (localData) {
            try {
                const parsedData = JSON.parse(localData);
                sectionDatabase = parsedData.data || parsedData;
                ensureAllSectionsExist();
                
                if (parsedData.timestamp) {
                    const saveDate = new Date(parsedData.timestamp);
                    lastSaveTimeElement.textContent = saveDate.toLocaleTimeString('ar-SA');
                }
            } catch (error) {
                console.error('خطأ في تحليل البيانات المحلية:', error);
                initializeDatabase();
            }
        } else {
            try {
                const snapshot = await database.ref('innovationMapData').once('value');
                if (snapshot.exists()) {
                    sectionDatabase = snapshot.val();
                    ensureAllSectionsExist();
                    saveDataLocally();
                } else {
                    initializeDatabase();
                }
            } catch (firebaseError) {
                console.error('خطأ في تحميل البيانات من Firebase:', firebaseError);
                initializeDatabase();
            }
        }
        return true;
    } catch (error) {
        console.error("خطأ عام في تحميل البيانات:", error);
        initializeDatabase();
        return false;
    }
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
    licenseBtn.addEventListener('click', activateLicense);
    
    // نوافذ الإضافة والتعديل
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
    document.querySelector('.suggestion-form').addEventListener('submit', function(e) {
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
        
        // حفظ الاقتراح في Firebase
        const suggestionsRef = database.ref('suggestions');
        suggestionsRef.push(companyData)
            .then(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                showNotification('شكراً لك!', 'تم استلام اقتراحك بنجاح وسيتم دراسته من قبل فريقنا');
                document.getElementById('suggest-company-modal').classList.remove('active');
            })
            .catch((error) => {
                console.error("Error saving suggestion: ", error);
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                showNotification('خطأ في النظام', 'فشل في إرسال الاقتراح، يرجى المحاولة لاحقاً');
            });
    });
    
    // حفظ قبل إغلاق النافذة
    window.addEventListener('beforeunload', saveDataLocally);
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);