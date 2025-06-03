/**
 * Financial Analysis Service
 * 
 * Provides comprehensive financial breakdown and budget analysis for film projects,
 * migrated from Cannes Demo with enhanced integration for Vadis Product system.
 */

import { storage } from '../storage';

export interface FinancialLineItem {
  account: string;
  description: string;
  total: number | null;
}

export interface FinancialSection {
  [key: string]: FinancialLineItem | number;
  total: number;
}

export interface FinancialBreakdown {
  projectName: string;
  expectedReleaseDate: string | null;
  location: string;
  prepWeeks: number;
  shootDays: string;
  unions: string;

  aboveTheLine: {
    storyRights: FinancialLineItem;
    producer: FinancialLineItem;
    director: FinancialLineItem;
    castAndStunts: FinancialLineItem;
    fringes: FinancialLineItem;
    total: number;
  };

  belowTheLineProduction: {
    productionStaff: FinancialLineItem;
    extrasStandins: FinancialLineItem;
    setDesign: FinancialLineItem;
    setConstruction: FinancialLineItem;
    setOperations: FinancialLineItem;
    specialEffects: FinancialLineItem;
    setDressing: FinancialLineItem;
    props: FinancialLineItem;
    wardrobe: FinancialLineItem;
    ledVirtual: FinancialLineItem;
    makeupHairdressing: FinancialLineItem;
    setLighting: FinancialLineItem;
    camera: FinancialLineItem;
    productionSound: FinancialLineItem;
    transportation: FinancialLineItem;
    locationExpenses: FinancialLineItem;
    pictureVehiclesAnimals: FinancialLineItem;
    productionFilmLab: FinancialLineItem;
    miscProduction: FinancialLineItem;
    healthSafety: FinancialLineItem;
    overtime: FinancialLineItem;
    studioEquipmentFacilities: FinancialLineItem;
    tests: FinancialLineItem;
    btlTravelLiving: FinancialLineItem;
    serviceCompany: FinancialLineItem;
    fringes: FinancialLineItem;
    total: number;
  };

  postProduction: {
    filmEditing: FinancialLineItem;
    music: FinancialLineItem;
    sound: FinancialLineItem;
    filmLabPost: FinancialLineItem;
    titles: FinancialLineItem;
    vfx: FinancialLineItem;
    fringes: FinancialLineItem;
    total: number;
  };

  otherBelowTheLine: {
    publicity: FinancialLineItem;
    insurance: FinancialLineItem;
    miscExpenses: FinancialLineItem;
    legalAccounting: FinancialLineItem;
    fringes: FinancialLineItem;
    total: number;
  };

  bondFee: FinancialLineItem;
  contingency: FinancialLineItem;

  // Summary totals
  summaryTotalAboveTheLine: number;
  summaryTotalBelowTheLine: number;
  summaryTotalAboveAndBelowTheLine: number;
  summaryGrandTotal: number;

  // Vadis-specific fields
  totalBudgetInput: number;
  estimatedBrandSponsorshipValue: number;
  estimatedLocationIncentiveValue: number;
  netExternalCapitalRequired: number;
}

function createLineItem(account: string, description: string, total: number | null = 0): FinancialLineItem {
  return { account, description, total };
}

/**
 * Generate comprehensive financial breakdown for a project
 */
export async function generateFinancialBreakdown(projectId: number): Promise<FinancialBreakdown | null> {
  try {
    const project = await storage.getProject(projectId);

    if (!project) {
      console.warn(`[Financial Analysis] Project with ID ${projectId} not found`);
      return null;
    }

    const totalBudgetInput = project.totalBudget || 0;

    console.log(`[Financial Analysis] Generating breakdown for "${project.title}" with budget: $${totalBudgetInput.toLocaleString()}`);

    // Create comprehensive financial breakdown structure
    const breakdown: FinancialBreakdown = {
      projectName: project.title,
      expectedReleaseDate: project.expectedReleaseDate,
      location: "TBD", // This would be determined from location analysis
      prepWeeks: 12,
      shootDays: "30 DAYS",
      unions: "DGA, WGA, SAG",

      aboveTheLine: {
        storyRights: createLineItem("1100", "STORY & RIGHTS", totalBudgetInput * 0.02),
        producer: createLineItem("1300", "PRODUCER", totalBudgetInput * 0.05),
        director: createLineItem("1400", "DIRECTOR", totalBudgetInput * 0.08),
        castAndStunts: createLineItem("1500", "CAST & STUNTS", totalBudgetInput * 0.15),
        fringes: createLineItem("1999", "Total Fringes", totalBudgetInput * 0.05),
        total: 0,
      },

      belowTheLineProduction: {
        productionStaff: createLineItem("2000", "PRODUCTION STAFF", totalBudgetInput * 0.08),
        extrasStandins: createLineItem("2100", "EXTRAS & STANDINS", totalBudgetInput * 0.02),
        setDesign: createLineItem("2200", "SET DESIGN", totalBudgetInput * 0.03),
        setConstruction: createLineItem("2300", "SET CONSTRUCTION", totalBudgetInput * 0.05),
        setOperations: createLineItem("2500", "SET OPERATIONS", totalBudgetInput * 0.04),
        specialEffects: createLineItem("2600", "SPECIAL EFFECTS", totalBudgetInput * 0.03),
        setDressing: createLineItem("2700", "SET DRESSING", totalBudgetInput * 0.02),
        props: createLineItem("2800", "PROPS", totalBudgetInput * 0.015),
        wardrobe: createLineItem("2900", "WARDROBE", totalBudgetInput * 0.025),
        ledVirtual: createLineItem("3000", "LED VIRTUAL", totalBudgetInput * 0.08),
        makeupHairdressing: createLineItem("3100", "MAKEUP & HAIRDRESSING", totalBudgetInput * 0.02),
        setLighting: createLineItem("3200", "SET LIGHTING", totalBudgetInput * 0.04),
        camera: createLineItem("3300", "CAMERA", totalBudgetInput * 0.06),
        productionSound: createLineItem("3400", "PRODUCTION SOUND", totalBudgetInput * 0.02),
        transportation: createLineItem("3500", "TRANSPORTATION", totalBudgetInput * 0.03),
        locationExpenses: createLineItem("3600", "LOCATION EXPENSES", totalBudgetInput * 0.04),
        pictureVehiclesAnimals: createLineItem("3700", "PICTURE VEHICLES/ANIMALS", totalBudgetInput * 0.01),
        productionFilmLab: createLineItem("3800", "PRODUCTION FILM AND LAB", totalBudgetInput * 0.01),
        miscProduction: createLineItem("3900", "MISC", totalBudgetInput * 0.02),
        healthSafety: createLineItem("3950", "HEALTH AND SAFETY PROTOCOLS", totalBudgetInput * 0.015),
        overtime: createLineItem("4100", "OVERTIME", totalBudgetInput * 0.03),
        studioEquipmentFacilities: createLineItem("4200", "STUDIO/EQUIPMENT/FACILITIES", totalBudgetInput * 0.05),
        tests: createLineItem("4300", "TESTS", totalBudgetInput * 0.005),
        btlTravelLiving: createLineItem("4450", "BTL T&L", totalBudgetInput * 0.02),
        serviceCompany: createLineItem("4455", "SERVICE COMPANY", totalBudgetInput * 0.03),
        fringes: createLineItem("4499", "Total Fringes", totalBudgetInput * 0.08),
        total: 0,
      },

      postProduction: {
        filmEditing: createLineItem("4500", "FILM EDITING", totalBudgetInput * 0.03),
        music: createLineItem("4600", "MUSIC", totalBudgetInput * 0.02),
        sound: createLineItem("4700", "SOUND", totalBudgetInput * 0.025),
        filmLabPost: createLineItem("4800", "FILM&LAB", totalBudgetInput * 0.015),
        titles: createLineItem("5000", "TITLES", totalBudgetInput * 0.005),
        vfx: createLineItem("5100", "VFX", totalBudgetInput * 0.12),
        fringes: createLineItem("5999", "Total Fringes", totalBudgetInput * 0.03),
        total: 0,
      },

      otherBelowTheLine: {
        publicity: createLineItem("6500", "PUBLICITY", totalBudgetInput * 0.02),
        insurance: createLineItem("6700", "INSURANCE", totalBudgetInput * 0.015),
        miscExpenses: createLineItem("6800", "MISC EXPENSES", totalBudgetInput * 0.01),
        legalAccounting: createLineItem("7500", "LEGAL & ACCOUNTING", totalBudgetInput * 0.015),
        fringes: createLineItem("7699", "Total Fringes", totalBudgetInput * 0.01),
        total: 0,
      },

      bondFee: createLineItem("9000", "BOND FEE", totalBudgetInput * 0.015),
      contingency: createLineItem("9100", "CONTINGENCY", totalBudgetInput * 0.10),

      // Initialize summary totals
      summaryTotalAboveTheLine: 0,
      summaryTotalBelowTheLine: 0,
      summaryTotalAboveAndBelowTheLine: 0,
      summaryGrandTotal: 0,

      // Vadis-specific fields
      totalBudgetInput: totalBudgetInput,
      estimatedBrandSponsorshipValue: 0,
      estimatedLocationIncentiveValue: 0,
      netExternalCapitalRequired: totalBudgetInput,
    };

    // Calculate section totals
    breakdown.aboveTheLine.total = (
      (breakdown.aboveTheLine.storyRights.total || 0) +
      (breakdown.aboveTheLine.producer.total || 0) +
      (breakdown.aboveTheLine.director.total || 0) +
      (breakdown.aboveTheLine.castAndStunts.total || 0) +
      (breakdown.aboveTheLine.fringes.total || 0)
    );

    breakdown.belowTheLineProduction.total = (
      (breakdown.belowTheLineProduction.productionStaff.total || 0) +
      (breakdown.belowTheLineProduction.extrasStandins.total || 0) +
      (breakdown.belowTheLineProduction.setDesign.total || 0) +
      (breakdown.belowTheLineProduction.setConstruction.total || 0) +
      (breakdown.belowTheLineProduction.setOperations.total || 0) +
      (breakdown.belowTheLineProduction.specialEffects.total || 0) +
      (breakdown.belowTheLineProduction.setDressing.total || 0) +
      (breakdown.belowTheLineProduction.props.total || 0) +
      (breakdown.belowTheLineProduction.wardrobe.total || 0) +
      (breakdown.belowTheLineProduction.ledVirtual.total || 0) +
      (breakdown.belowTheLineProduction.makeupHairdressing.total || 0) +
      (breakdown.belowTheLineProduction.setLighting.total || 0) +
      (breakdown.belowTheLineProduction.camera.total || 0) +
      (breakdown.belowTheLineProduction.productionSound.total || 0) +
      (breakdown.belowTheLineProduction.transportation.total || 0) +
      (breakdown.belowTheLineProduction.locationExpenses.total || 0) +
      (breakdown.belowTheLineProduction.pictureVehiclesAnimals.total || 0) +
      (breakdown.belowTheLineProduction.productionFilmLab.total || 0) +
      (breakdown.belowTheLineProduction.miscProduction.total || 0) +
      (breakdown.belowTheLineProduction.healthSafety.total || 0) +
      (breakdown.belowTheLineProduction.overtime.total || 0) +
      (breakdown.belowTheLineProduction.studioEquipmentFacilities.total || 0) +
      (breakdown.belowTheLineProduction.tests.total || 0) +
      (breakdown.belowTheLineProduction.btlTravelLiving.total || 0) +
      (breakdown.belowTheLineProduction.serviceCompany.total || 0) +
      (breakdown.belowTheLineProduction.fringes.total || 0)
    );

    breakdown.postProduction.total = (
      (breakdown.postProduction.filmEditing.total || 0) +
      (breakdown.postProduction.music.total || 0) +
      (breakdown.postProduction.sound.total || 0) +
      (breakdown.postProduction.filmLabPost.total || 0) +
      (breakdown.postProduction.titles.total || 0) +
      (breakdown.postProduction.vfx.total || 0) +
      (breakdown.postProduction.fringes.total || 0)
    );

    breakdown.otherBelowTheLine.total = (
      (breakdown.otherBelowTheLine.publicity.total || 0) +
      (breakdown.otherBelowTheLine.insurance.total || 0) +
      (breakdown.otherBelowTheLine.miscExpenses.total || 0) +
      (breakdown.otherBelowTheLine.legalAccounting.total || 0) +
      (breakdown.otherBelowTheLine.fringes.total || 0)
    );

    // Calculate summary totals
    breakdown.summaryTotalAboveTheLine = breakdown.aboveTheLine.total;
    breakdown.summaryTotalBelowTheLine = 
      breakdown.belowTheLineProduction.total + 
      breakdown.postProduction.total + 
      breakdown.otherBelowTheLine.total;
    
    breakdown.summaryTotalAboveAndBelowTheLine = 
      breakdown.summaryTotalAboveTheLine + breakdown.summaryTotalBelowTheLine;
    
    breakdown.summaryGrandTotal = 
      breakdown.summaryTotalAboveAndBelowTheLine + 
      (breakdown.contingency.total || 0) + 
      (breakdown.bondFee.total || 0);

    // Calculate net external capital requirements
    breakdown.netExternalCapitalRequired = 
      breakdown.summaryGrandTotal - 
      breakdown.estimatedBrandSponsorshipValue - 
      breakdown.estimatedLocationIncentiveValue;

    console.log(`[Financial Analysis] Generated breakdown with grand total: $${breakdown.summaryGrandTotal.toLocaleString()}`);

    return breakdown;

  } catch (error) {
    console.error("[Financial Analysis] Error generating financial breakdown:", error);
    return null;
  }
}

/**
 * Calculate estimated brand sponsorship value based on product placements
 */
export async function calculateBrandSponsorshipValue(projectId: number): Promise<number> {
  try {
    // This would integrate with product placement analysis
    // For now, return estimated value based on project scope
    const project = await storage.getProject(projectId);
    if (!project) return 0;

    const baseValue = (project.totalBudget || 0) * 0.05; // 5% of budget as potential sponsorship
    console.log(`[Financial Analysis] Estimated brand sponsorship value: $${baseValue.toLocaleString()}`);
    return baseValue;

  } catch (error) {
    console.error("[Financial Analysis] Error calculating brand sponsorship value:", error);
    return 0;
  }
}

/**
 * Calculate estimated location incentive value
 */
export async function calculateLocationIncentiveValue(projectId: number): Promise<number> {
  try {
    // This would integrate with location analysis to get actual tax incentives
    const project = await storage.getProject(projectId);
    if (!project) return 0;

    const baseValue = (project.totalBudget || 0) * 0.15; // 15% average tax incentive
    console.log(`[Financial Analysis] Estimated location incentive value: $${baseValue.toLocaleString()}`);
    return baseValue;

  } catch (error) {
    console.error("[Financial Analysis] Error calculating location incentive value:", error);
    return 0;
  }
}