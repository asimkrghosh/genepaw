import jsPDF from "jspdf";
import "jspdf-autotable";

function drawGenePawLogo(doc, x, y, size) {
  doc.setFillColor(15, 74, 50);
  doc.roundedRect(x, y, size, size, size * 0.2, size * 0.2, "F");
  doc.setGState(new doc.GState({ opacity: 0.5 }));
  doc.setFillColor(45, 157, 111);
  doc.roundedRect(x + size * 0.15, y + size * 0.15, size * 0.85, size * 0.85, size * 0.15, size * 0.15, "F");
  doc.setGState(new doc.GState({ opacity: 1.0 }));

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(size * 0.04);
  doc.setLineCap("round");

  const cx = x + size / 2;
  const top = y + size * 0.18;
  const bot = y + size * 0.82;
  const helixH = bot - top;
  const amp = size * 0.2;
  const segments = 50;

  for (let strand = 0; strand < 2; strand++) {
    const phase = strand * Math.PI;
    let prevPx = null, prevPy = null;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const py = top + t * helixH;
      const px = cx + Math.sin(t * Math.PI * 2.5 + phase) * amp;
      if (prevPx !== null) doc.line(prevPx, prevPy, px, py);
      prevPx = px;
      prevPy = py;
    }
  }

  doc.setLineWidth(size * 0.025);
  const rungCount = 5;
  for (let i = 1; i <= rungCount; i++) {
    const t = i / (rungCount + 1);
    const py = top + t * helixH;
    const x1 = cx + Math.sin(t * Math.PI * 2.5) * amp;
    const x2 = cx + Math.sin(t * Math.PI * 2.5 + Math.PI) * amp;
    doc.line(x1, py, x2, py);
  }
  doc.setLineCap("butt");
}

export function generateVetReportPDF(petName, sampleId, results) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;

  const C = {
    green: [15, 74, 50], greenLight: [45, 157, 111], greenPale: [240, 253, 244],
    amber: [245, 158, 11], red: [239, 68, 68], greenBright: [34, 197, 94],
    blue: [59, 130, 246], purple: [139, 92, 246], pink: [236, 72, 153],
    teal: [20, 184, 166], orange: [249, 115, 22],
    text: [31, 41, 55], textLight: [107, 114, 128], white: [255, 255, 255],
    bgLight: [248, 250, 249], border: [229, 231, 235],
  };
  const breedColors = [[27, 107, 74], [245, 158, 11], [59, 130, 246], [239, 68, 68], [139, 92, 246], [236, 72, 153], [20, 184, 166], [249, 115, 22]];
  const statusColors = { clear: C.greenBright, carrier: C.amber, at_risk: C.red };
  const statusLabels = { clear: "Clear", carrier: "Carrier", at_risk: "At Risk" };
  const riskColors = { low: C.greenBright, medium: C.amber, high: C.red };

  let y = 0;

  const checkPage = (needed) => { if (y + needed > pageH - 28) { doc.addPage(); y = 20; } };

  const drawPill = (x, py, text, bgColor, textColor) => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const tw = doc.getTextWidth(text);
    const pw = tw + 8; const ph = 5.5;
    doc.setFillColor(...bgColor);
    doc.roundedRect(x, py - ph / 2 - 1, pw, ph, 2.5, 2.5, "F");
    doc.setTextColor(...textColor);
    doc.text(text, x + 4, py);
    return pw;
  };

  const drawSectionHeader = (num, title) => {
    checkPage(20);
    doc.setFillColor(...C.green);
    doc.roundedRect(margin, y, contentW, 12, 2, 2, "F");
    doc.setTextColor(...C.white);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${num}. ${title}`, margin + 6, y + 8);
    y += 18;
  };

  doc.setFillColor(...C.green);
  doc.rect(0, 0, pageW, 52, "F");
  doc.setFillColor(...C.greenLight);
  doc.rect(0, 52, pageW, 2, "F");

  drawGenePawLogo(doc, margin, 8, 14);

  doc.setTextColor(...C.white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("GenePaw", margin + 18, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Multi-Species Genomics Platform", margin + 18, 26);
  doc.setFontSize(8);
  doc.text("Veterinary Genomic Report", margin + 18, 34);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, pageW - margin, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Sample ID: ${sampleId}`, pageW - margin, 28, { align: "right" });
  doc.text("CONFIDENTIAL — For Veterinary Use", pageW - margin, 36, { align: "right" });

  y = 62;

  doc.setFillColor(...C.bgLight);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 18, 3, 3, "FD");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.green);
  doc.text(`${petName}'s Genomic Report`, margin + 8, y + 12);
  drawPill(pageW - margin - 32, y + 11, "COMPLETED", C.greenBright, C.white);
  y += 24;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textLight);
  const overviewLines = doc.splitTextToSize(
    `This comprehensive genomic report for ${petName} (Sample ID: ${sampleId}) was generated using GenePaw's next-generation sequencing pipeline, analyzing millions of genetic markers across the genome. The report covers breed ancestry composition, hereditary health screening, behavioral trait predictions, personalized nutrition recommendations, and genetic relative matching. All results should be reviewed and interpreted with a qualified veterinary professional.`,
    contentW - 8
  );
  overviewLines.forEach((line) => { doc.text(line, margin + 4, y); y += 4; });
  y += 4;

  drawSectionHeader("1", "Breed Composition");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textLight);
  const breedDesc = doc.splitTextToSize(
    `${petName}'s DNA was compared against our reference database of breed-specific genetic signatures. The chart below shows the percentage contribution of each detected breed to ${petName}'s overall genetic makeup.`,
    contentW - 8
  );
  breedDesc.forEach((line) => { doc.text(line, margin + 4, y); y += 3.8; });
  y += 4;

  const breeds = results.breedComposition;
  const cx = margin + 40; const cy = y + 40; const outerR = 32; const innerR = 18;
  let startAngle = -Math.PI / 2;

  breeds.forEach((b, i) => {
    const sliceAngle = (b.value / 100) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;
    const color = breedColors[i % breedColors.length];
    doc.setFillColor(...color);
    const pts = [];
    const steps = Math.max(20, Math.round(sliceAngle * 30));
    for (let s = 0; s <= steps; s++) {
      const a = startAngle + (sliceAngle * s) / steps;
      pts.push([cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR]);
    }
    for (let s = steps; s >= 0; s--) {
      const a = startAngle + (sliceAngle * s) / steps;
      pts.push([cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR]);
    }
    doc.setLineWidth(0);
    doc.setDrawColor(...color);
    doc.moveTo(pts[0][0], pts[0][1]);
    pts.forEach(p => doc.lineTo(p[0], p[1]));
    doc.fill();
    startAngle = endAngle;
  });

  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, innerR - 0.5, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.textLight);
  doc.text("DNA", cx, cy - 1, { align: "center" });
  doc.setFontSize(6);
  doc.text("PROFILE", cx, cy + 3, { align: "center" });

  const legendX = margin + 85;
  let legendY = y + 8;
  breeds.forEach((b, i) => {
    const color = breedColors[i % breedColors.length];
    doc.setFillColor(...color);
    doc.roundedRect(legendX, legendY - 3, 5, 5, 1, 1, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.text);
    doc.text(`${b.value}%`, legendX + 8, legendY + 1);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.textLight);
    doc.text(b.name, legendX + 22, legendY + 1);
    legendY += 9;
  });

  y += 82;
  const barY = y;
  const barH = 8;
  let barX = margin;
  breeds.forEach((b, i) => {
    const segW = (b.value / 100) * contentW;
    doc.setFillColor(...breedColors[i % breedColors.length]);
    if (i === 0) doc.roundedRect(barX, barY, segW, barH, 3, 3, "F");
    else if (i === breeds.length - 1) doc.roundedRect(barX, barY, segW, barH, 3, 3, "F");
    else doc.rect(barX, barY, segW, barH, "F");
    if (i > 0) doc.rect(barX, barY, 3, barH, "F");
    if (i < breeds.length - 1) doc.rect(barX + segW - 3, barY, 3, barH, "F");
    barX += segW;
  });
  y += 16;

  drawSectionHeader("2", "Health Markers");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textLight);
  const healthDesc = doc.splitTextToSize(
    `The following health markers were screened across ${petName}'s genome. Each marker is classified as Clear (no copies of the variant detected), Carrier (one copy detected — typically unaffected but can pass to offspring), or At Risk (two copies detected — may develop or be predisposed to the condition). Risk levels indicate clinical significance.`,
    contentW - 8
  );
  healthDesc.forEach((line) => { doc.text(line, margin + 4, y); y += 3.8; });
  y += 4;

  const clearCount = results.healthMarkers.filter(h => h.status === "clear").length;
  const carrierCount = results.healthMarkers.filter(h => h.status === "carrier").length;
  const riskCount = results.healthMarkers.filter(h => h.status === "at_risk").length;
  const summaryW = contentW / 3;

  checkPage(18);
  [[`${clearCount} Clear`, C.greenBright, C.greenPale], [`${carrierCount} Carrier`, C.amber, [255, 251, 235]], [`${riskCount} At Risk`, C.red, [254, 242, 242]]].forEach(([label, color, bg], i) => {
    const sx = margin + i * summaryW + 2;
    doc.setFillColor(...bg);
    doc.roundedRect(sx, y, summaryW - 4, 12, 2, 2, "F");
    doc.setFillColor(...color);
    doc.circle(sx + 6, y + 6, 2.5, "F");
    doc.setTextColor(...color);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, sx + 12, y + 7.5);
  });
  y += 18;

  results.healthMarkers.forEach((h) => {
    checkPage(16);
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, y, contentW, 13, 2, 2, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.text);
    doc.text(h.gene, margin + 5, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.textLight);
    doc.text(h.condition, margin + 45, y + 8);
    const sColor = statusColors[h.status] || C.textLight;
    drawPill(margin + contentW - 55, y + 8, (statusLabels[h.status] || h.status).toUpperCase(), sColor, C.white);
    const rColor = riskColors[h.risk] || C.textLight;
    drawPill(margin + contentW - 28, y + 8, h.risk.toUpperCase(), rColor, C.white);
    y += 15;
  });
  y += 6;

  checkPage(80);
  drawSectionHeader("3", "Behavior Traits");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textLight);
  const behaviorDesc = doc.splitTextToSize(
    `Behavioral predispositions are estimated from genetic markers associated with temperament and activity. Scores range from 0 to 100 and are compared against the breed average (shown as a dashed line). These predictions reflect genetic tendencies and may vary based on training, environment, and socialization.`,
    contentW - 8
  );
  behaviorDesc.forEach((line) => { doc.text(line, margin + 4, y); y += 3.8; });
  y += 4;

  const bTraitBarW = 90;
  const bTraitX = margin + 55;
  results.behaviorTraits.forEach((b) => {
    checkPage(14);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.text);
    doc.text(b.trait, margin + 4, y + 5);
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(bTraitX, y, bTraitBarW, 7, 3, 3, "F");
    const avgX = bTraitX + (b.avg / 100) * bTraitBarW;
    doc.setDrawColor(...C.textLight);
    doc.setLineWidth(0.8);
    doc.setLineDashPattern([1.5, 1], 0);
    doc.line(avgX, y - 1, avgX, y + 8);
    doc.setLineDashPattern([], 0);
    const scoreW = (b.score / 100) * bTraitBarW;
    const barColor = b.score >= 70 ? C.greenBright : b.score >= 40 ? C.amber : C.red;
    doc.setFillColor(...barColor);
    doc.roundedRect(bTraitX, y, scoreW, 7, 3, 3, "F");
    if (scoreW > 6 && scoreW < bTraitBarW - 3) doc.rect(bTraitX + scoreW - 3, y, 3, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.text);
    doc.text(`${b.score}`, bTraitX + bTraitBarW + 4, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.textLight);
    doc.text(`avg ${b.avg}`, bTraitX + bTraitBarW + 15, y + 5.5);
    y += 12;
  });

  y += 2;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textLight);
  doc.setFillColor(...C.greenBright);
  doc.roundedRect(bTraitX, y, 10, 3, 1, 1, "F");
  doc.text("Pet's Score", bTraitX + 13, y + 2.5);
  doc.setDrawColor(...C.textLight);
  doc.setLineWidth(0.8);
  doc.setLineDashPattern([1.5, 1], 0);
  doc.line(bTraitX + 45, y + 1.5, bTraitX + 55, y + 1.5);
  doc.setLineDashPattern([], 0);
  doc.text("Breed Average", bTraitX + 58, y + 2.5);
  y += 10;

  checkPage(80);
  drawSectionHeader("4", "Nutrition Profile");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textLight);
  const nutritionDesc = doc.splitTextToSize(
    `Based on ${petName}'s breed composition, size, and genetic health markers, the following personalized nutrition guidelines are recommended. These include daily macronutrient targets, beneficial supplements, foods to avoid due to breed-specific toxicity risks, and any detected dietary sensitivities.`,
    contentW - 8
  );
  nutritionDesc.forEach((line) => { doc.text(line, margin + 4, y); y += 3.8; });
  y += 4;

  const np = results.nutritionProfile;
  const cardW = (contentW - 9) / 4;
  const macros = [
    { label: "Calories", value: np.calories, color: C.amber },
    { label: "Protein", value: np.protein, color: C.green },
    { label: "Fat", value: np.fat, color: C.blue },
    { label: "Fiber", value: np.fiber, color: C.purple },
  ];
  checkPage(26);
  macros.forEach((m, i) => {
    const mx = margin + i * (cardW + 3);
    doc.setFillColor(...m.color);
    doc.roundedRect(mx, y, cardW, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(m.label, mx + 5, y + 7);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(m.value || "—", mx + 5, y + 16);
  });
  y += 28;

  checkPage(20);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, contentW, 6, 2, 2, "F");
  doc.setTextColor(...C.green);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("RECOMMENDED SUPPLEMENTS", margin + 4, y + 4.2);
  y += 9;
  (np.supplements || []).forEach((s) => {
    checkPage(7);
    doc.setFillColor(220, 252, 231);
    doc.circle(margin + 5, y + 0.5, 1.5, "F");
    doc.setTextColor(...C.text);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(s, margin + 10, y + 2);
    y += 6;
  });
  y += 3;

  checkPage(20);
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, y, contentW, 6, 2, 2, "F");
  doc.setTextColor(...C.red);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FOODS TO AVOID", margin + 4, y + 4.2);
  y += 9;
  (np.avoid || []).forEach((s) => {
    checkPage(7);
    doc.setFillColor(...C.red);
    doc.circle(margin + 5.5, y + 1.2, 1.3, "F");
    doc.setTextColor(...C.text);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(s, margin + 10, y + 2);
    y += 6;
  });
  y += 3;

  if (np.sensitivities && np.sensitivities.length > 0) {
    checkPage(20);
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, y, contentW, 6, 2, 2, "F");
    doc.setTextColor(...C.amber);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("SENSITIVITIES", margin + 4, y + 4.2);
    y += 9;
    np.sensitivities.forEach((s) => {
      checkPage(7);
      doc.setFillColor(...C.amber);
      doc.circle(margin + 5.5, y + 1.2, 1.3, "F");
      doc.setTextColor(...C.text);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(s, margin + 10, y + 2);
      y += 6;
    });
  }
  y += 8;

  if (results.relatives && results.relatives.length > 0) {
    checkPage(60);
    drawSectionHeader("5", "Genetic Relatives");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.textLight);
    const relativesDesc = doc.splitTextToSize(
      `${petName}'s genome was compared against other animals in the GenePaw database to identify potential genetic relatives. The match percentage indicates the degree of shared genetic material. Higher percentages suggest closer familial relationships such as siblings or parent-offspring pairs.`,
      contentW - 8
    );
    relativesDesc.forEach((line) => { doc.text(line, margin + 4, y); y += 3.8; });
    y += 4;

    results.relatives.forEach((r) => {
      checkPage(22);
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, y, contentW, 18, 2, 2, "FD");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.text);
      doc.text(r.name, margin + 5, y + 7);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...C.textLight);
      doc.text(`${r.relation} • ${r.location || ""}${r.owner ? " • " + r.owner : ""}`, margin + 5, y + 13);
      const mbX = margin + contentW - 65;
      const mbW = 50;
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(mbX, y + 4, mbW, 5, 2, 2, "F");
      const matchW = (r.match / 100) * mbW;
      const matchColor = r.match >= 80 ? C.greenBright : r.match >= 50 ? C.amber : C.blue;
      doc.setFillColor(...matchColor);
      doc.roundedRect(mbX, y + 4, matchW, 5, 2, 2, "F");
      if (matchW > 4 && matchW < mbW - 2) doc.rect(mbX + matchW - 2, y + 4, 2, 5, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...matchColor);
      doc.text(`${r.match}%`, mbX + mbW + 4, y + 8);
      y += 21;
    });
  }
  y += 6;

  checkPage(30);
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, y, contentW, 24, 2, 2, "FD");
  doc.setTextColor(...C.textLight);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Important Disclaimer", margin + 4, y + 5);
  doc.setFont("helvetica", "italic");
  doc.text("This genomic report is generated by GenePaw's next-generation sequencing and bioinformatics pipeline and is intended for informational purposes only.", margin + 4, y + 10);
  doc.text("Results should be reviewed and interpreted by a qualified veterinary professional. Genetic testing identifies predispositions and does not replace clinical", margin + 4, y + 14);
  doc.text("diagnosis, physical examination, or laboratory testing. Behavioral and nutritional recommendations are estimates based on genetic data and may vary.", margin + 4, y + 18);

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setFillColor(...C.green);
    doc.rect(0, ph - 14, pageW, 14, "F");
    doc.setFillColor(...C.greenLight);
    doc.rect(0, ph - 15, pageW, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("GenePaw — Confidential Veterinary Genomic Report", margin, ph - 5);
    doc.text(`www.genepaw.com`, pageW / 2, ph - 5, { align: "center" });
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, ph - 5, { align: "right" });
  }

  doc.save(`GenePaw_Vet_Report_${petName.replace(/\s+/g, "_")}.pdf`);
}
