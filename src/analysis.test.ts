import {ReimbursementAnalyzer, ReimbursementCase} from './analysis';

describe('ReimbursementAnalyzer', () => {
  const mockCases: ReimbursementCase[] = [
    // 1-day trips
    {
      input: {
        trip_duration_days: 1,
        miles_traveled: 100,
        total_receipts_amount: 50,
      },
      expected_output: 150,
    },
    {
      input: {
        trip_duration_days: 1,
        miles_traveled: 200,
        total_receipts_amount: 100,
      },
      expected_output: 250,
    },
    // 5-day trips with ~100 mi/day efficiency
    {
      input: {
        trip_duration_days: 5,
        miles_traveled: 500,
        total_receipts_amount: 300,
      },
      expected_output: 800,
    },
    {
      input: {
        trip_duration_days: 5,
        miles_traveled: 450,
        total_receipts_amount: 250,
      },
      expected_output: 700,
    },
    {
      input: {
        trip_duration_days: 5,
        miles_traveled: 550,
        total_receipts_amount: 350,
      },
      expected_output: 900,
    },
    {
      input: {
        trip_duration_days: 5,
        miles_traveled: 475,
        total_receipts_amount: 275,
      },
      expected_output: 750,
    },
    {
      input: {
        trip_duration_days: 5,
        miles_traveled: 525,
        total_receipts_amount: 325,
      },
      expected_output: 850,
    },
    // 5-day trips with ~200 mi/day efficiency
    {
      input: {
        trip_duration_days: 5,
        miles_traveled: 1000,
        total_receipts_amount: 600,
      },
      expected_output: 1200,
    },
    {
      input: {
        trip_duration_days: 5,
        miles_traveled: 950,
        total_receipts_amount: 550,
      },
      expected_output: 1100,
    },
    {
      input: {
        trip_duration_days: 5,
        miles_traveled: 1050,
        total_receipts_amount: 650,
      },
      expected_output: 1300,
    },
    {
      input: {
        trip_duration_days: 5,
        miles_traveled: 975,
        total_receipts_amount: 575,
      },
      expected_output: 1150,
    },
    {
      input: {
        trip_duration_days: 5,
        miles_traveled: 1025,
        total_receipts_amount: 625,
      },
      expected_output: 1250,
    },
  ];

  let analyzer: ReimbursementAnalyzer;

  beforeEach(() => {
    analyzer = new ReimbursementAnalyzer(mockCases);
  });

  describe('analyzeByDuration', () => {
    it('should group cases by duration and calculate averages', () => {
      const analysis = analyzer.analyzeByDuration();

      expect(analysis).toHaveLength(2); // 1-day and 5-day trips

      const oneDayAnalysis = analysis.find(a => a.days === 1);
      expect(oneDayAnalysis).toBeDefined();
      expect(oneDayAnalysis?.caseCount).toBe(2);
      expect(oneDayAnalysis?.averageOutput).toBe(200); // (150 + 250) / 2
      expect(oneDayAnalysis?.averagePerDay).toBe(200); // Same as averageOutput for 1-day trips

      const fiveDayAnalysis = analysis.find(a => a.days === 5);
      expect(fiveDayAnalysis).toBeDefined();
      expect(fiveDayAnalysis?.caseCount).toBe(10);
      expect(fiveDayAnalysis?.averageOutput).toBe(1000); // (800 + 1200) / 2
      expect(fiveDayAnalysis?.averagePerDay).toBe(200); // 1000 / 5
    });
  });

  describe('analyzeOneDayTrips', () => {
    it('should analyze 1-day trips and calculate implied rates', () => {
      const analysis = analyzer.analyzeOneDayTrips();

      expect(analysis).toHaveLength(2);

      const firstTrip = analysis[0];
      expect(firstTrip.miles).toBe(100);
      expect(firstTrip.receipts).toBe(50);
      expect(firstTrip.output).toBe(150);
      expect(firstTrip.impliedRate).toBe(0.5); // (150 - 100) / 100

      const secondTrip = analysis[1];
      expect(secondTrip.miles).toBe(200);
      expect(secondTrip.receipts).toBe(100);
      expect(secondTrip.output).toBe(250);
      expect(secondTrip.impliedRate).toBe(0.75); // (250 - 100) / 200
    });
  });

  describe('analyzeFiveDayTrips', () => {
    it('should analyze 5-day trips and calculate bonuses', () => {
      const analysis = analyzer.analyzeFiveDayTrips();

      expect(analysis).toHaveLength(10); // Now we have 10 five-day trips

      const firstTrip = analysis[0];
      expect(firstTrip.miles).toBe(500);
      expect(firstTrip.receipts).toBe(300);
      expect(firstTrip.output).toBe(800);
      expect(firstTrip.bonusOverBase).toBe(300); // 800 - (5 * 100)
      expect(firstTrip.efficiency).toBe(100); // 500 / 5

      const lastTrip = analysis[9]; // Check the last trip instead
      expect(lastTrip.miles).toBe(1025);
      expect(lastTrip.receipts).toBe(625);
      expect(lastTrip.output).toBe(1250);
      expect(lastTrip.bonusOverBase).toBe(750); // 1250 - (5 * 100)
      expect(lastTrip.efficiency).toBe(205); // 1025 / 5
    });
  });

  describe('analyzeEfficiencyBonus', () => {
    it('should group cases by efficiency and calculate averages', () => {
      const analysis = analyzer.analyzeEfficiencyBonus();

      // Should have at least one bucket with our test data
      expect(analysis.length).toBeGreaterThan(0);

      // Find the 100 mi/day bucket (includes 1 one-day trip + 5 five-day trips)
      const hundredMileBucket = analysis.find(a => a.bucket === 100);
      expect(hundredMileBucket).toBeDefined();
      expect(hundredMileBucket?.caseCount).toBe(6); // 1 + 5 = 6 cases
      // Average should be around 158.33 per day
      expect(hundredMileBucket?.averageOutputPerDay).toBeCloseTo(158.33, 1);

      // Find the 200 mi/day bucket (includes 1 one-day trip + 5 five-day trips)
      const twoHundredMileBucket = analysis.find(a => a.bucket === 200);
      expect(twoHundredMileBucket).toBeDefined();
      expect(twoHundredMileBucket?.caseCount).toBe(6); // 1 + 5 = 6 cases
      // Average should be around 241.67 per day
      expect(twoHundredMileBucket?.averageOutputPerDay).toBeCloseTo(241.67, 1);
    });
  });
});
