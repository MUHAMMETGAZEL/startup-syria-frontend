// متغيرات الخريطة
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
    color: "#018985", 
    startAngle: 0, 
    endAngle: 2*Math.PI/5, 
    subsections: [
      "Incubators",
      "Venture Studios",
      "Competition Events",
      "Mentorship Programs",
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
           /* .attr("fill", sector.color)*/
            .attr("fill", d3.color(sector.color).brighter(0.6))
            .attr("stroke", "white")
         /*   .attr("stroke-width", 1) */
             .attr("stroke-width",4)
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
       /*   .attr("fill", sector.color)*/
           .attr("fill", d3.color(sector.color).darker(0.7))
          .attr("stroke", "white")
        /*  .attr("stroke-width", 1)*/
            .attr("stroke-width",5)
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
  /*
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
  }); */
const innerLabels = [
  { text: "Regulations and Government Support", angle: Math.PI * 0.5 + rotationAngle },
  { text: "Ideation Support", angle: Math.PI * 1.7 + rotationAngle },
  { text: "Networking and Cultures", angle: Math.PI * 0.9 + rotationAngle },
  { text: "Operation, Growth and Markets", angle: Math.PI * 0.1 + rotationAngle },
  { text: "Funding", angle: Math.PI * 3.3 + rotationAngle }
];

const arcTextRadius = 100; // عدّل المسافة هنا حسب الحاجة
const arcLength = 0.45;

innerLabels.forEach((label, i) => {
  const angleDeg = label.angle * 180 / Math.PI;
  const shouldFlip = angleDeg > 90 && angleDeg < 270;

  let startAngle = label.angle - arcLength / 2;
  let endAngle = label.angle + arcLength / 2;

  if (shouldFlip) {
    [startAngle, endAngle] = [endAngle, startAngle]; // قلب الاتجاه بدون scale
  }

  const arcPath = d3.arc()
    .innerRadius(arcTextRadius)
    .outerRadius(arcTextRadius)
    .startAngle(startAngle)
    .endAngle(endAngle);

  const pathId = `inner-label-path-${i}`;

  svg.append("path")
    .attr("id", pathId)
    .attr("d", arcPath())
    .attr("fill", "none")
    .attr("stroke", "none")
    .attr("transform", `translate(${centerX}, ${centerY})`);

  svg.append("text")
    .append("textPath")
    .attr("href", `#${pathId}`)
    .attr("startOffset", "50%")
    .attr("text-anchor", "middle")
    .attr("font-size", "13px")
    .attr("font-weight", "bold")
    .attr("fill", "#ffffff")
    .text(label.text);
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
         /* .attr("stroke-width", 2)*/
            .attr("stroke-width", 3)
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
       /*   .attr("stroke-width", 1)*/
            .attr("stroke-width", 2)
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
     /* .attr("stroke-width", 1);*/
      .attr("stroke-width", 3);
    
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
  nestingLevel = 0;
  drawMap();
}

window.addEventListener('resize', () => {
  const bounds = document.getElementById('concentric-map').getBoundingClientRect();
  let centerX = bounds.width / 2;
  let centerY = bounds.height / 2;
  drawMap(); // أو إعادة إنشاء الخريطة بناءً على المتغيرات الجديدة
});
