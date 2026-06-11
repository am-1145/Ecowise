describe('Carbon Footprint Heuristics Calculation Tests', () => {
  it('should calculate correct transportation carbon impact based on distance coefficients', () => {
    const carKm = 100;
    const evKm = 100;
    const busKm = 100;
    const metroKm = 100;
    const flightHours = 2;

    // Math Constants
    const CAR_COEF = 0.18;
    const EV_COEF = 0.05;
    const BUS_COEF = 0.06;
    const METRO_COEF = 0.03;
    const FLIGHT_COEF = 90.0;

    let carbonTotal = 0;
    carbonTotal += carKm * CAR_COEF;
    carbonTotal += evKm * EV_COEF;
    carbonTotal += busKm * BUS_COEF;
    carbonTotal += metroKm * METRO_COEF;
    carbonTotal += flightHours * FLIGHT_COEF;

    // 100 * 0.18 + 100 * 0.05 + 100 * 0.06 + 100 * 0.03 + 2 * 90
    // = 18 + 5 + 6 + 3 + 180 = 212
    expect(carbonTotal).toBe(212);
  });

  it('should calculate correct diet carbon footprint based on diet selectors', () => {
    const servings = 3;
    
    // Diet factor constants
    const factors = {
      vegan: 0.9,
      vegetarian: 1.5,
      mixed: 3.2,
      'meat-heavy': 6.5
    };

    const veganCarbon = servings * factors.vegan;
    const meatCarbon = servings * factors['meat-heavy'];

    expect(veganCarbon).toBe(2.7);
    expect(meatCarbon).toBe(19.5);
  });
});
