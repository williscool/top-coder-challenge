import * as fs from 'fs';
import * as path from 'path';

interface ReimbursementCase {
  input: {
    trip_duration_days: number;
    miles_traveled: number;
    total_receipts_amount: number;
  };
  expected_output: number;
}

interface DurationAnalysis {
  days: number;
  caseCount: number;
  averageOutput: number;
  averagePerDay: number;
  examples: ReimbursementCase[];
}

interface MileageAnalysis {
  miles: number;
  receipts: number;
  output: number;
  impliedRate: number;
}

interface FiveDayAnalysis {
  miles: number;
  receipts: number;
  output: number;
  bonusOverBase: number;
  efficiency: number;
}

interface EfficiencyAnalysis {
  bucket: number;
  caseCount: number;
  averageOutputPerDay: number;
}

class ReimbursementAnalyzer {
  private cases: ReimbursementCase[];

  constructor(cases: ReimbursementCase[]) {
    this.cases = cases;
  }

  private calculateMean(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  public analyzeByDuration(): DurationAnalysis[] {
    const byDays = new Map<number, ReimbursementCase[]>();
    
    // Group cases by duration
    this.cases.forEach(case_ => {
      const days = case_.input.trip_duration_days;
      if (!byDays.has(days)) {
        byDays.set(days, []);
      }
      byDays.get(days)!.push(case_);
    });

    // Calculate statistics for each duration
    return Array.from(byDays.entries()).map(([days, cases]) => ({
      days,
      caseCount: cases.length,
      averageOutput: this.calculateMean(cases.map(c => c.expected_output)),
      averagePerDay: this.calculateMean(cases.map(c => c.expected_output)) / days,
      examples: cases.slice(0, 5) // Show up to 5 examples
    })).sort((a, b) => a.days - b.days);
  }

  public analyzeOneDayTrips(): MileageAnalysis[] {
    const oneDayCases = this.cases
      .filter(case_ => case_.input.trip_duration_days === 1)
      .slice(0, 10);

    return oneDayCases.map(case_ => {
      const { miles_traveled, total_receipts_amount } = case_.input;
      const output = case_.expected_output;
      const remaining = output - 100; // Base rate assumption
      const impliedRate = miles_traveled > 0 ? remaining / miles_traveled : 0;

      return {
        miles: miles_traveled,
        receipts: total_receipts_amount,
        output,
        impliedRate
      };
    });
  }

  public analyzeFiveDayTrips(): FiveDayAnalysis[] {
    const fiveDayCases = this.cases
      .filter(case_ => case_.input.trip_duration_days === 5)
      .slice(0, 10);

    return fiveDayCases.map(case_ => {
      const { miles_traveled, total_receipts_amount } = case_.input;
      const output = case_.expected_output;
      const baseExpected = 5 * 100; // 5 days * $100
      const bonus = output - baseExpected;
      const efficiency = miles_traveled / 5;

      return {
        miles: miles_traveled,
        receipts: total_receipts_amount,
        output,
        bonusOverBase: bonus,
        efficiency
      };
    });
  }

  public analyzeMileageTiers(): void {
    console.log("=== MILEAGE TIER ANALYSIS ===");
    const oneDayTrips = this.cases
      .filter(case_ => case_.input.trip_duration_days === 1)
      .sort((a, b) => a.input.miles_traveled - b.input.miles_traveled);

    console.log("Miles -> Output (1-day trips, sorted by mileage)");
    oneDayTrips.slice(0, 20).forEach(case_ => {
      const { miles_traveled, total_receipts_amount } = case_.input;
      console.log(
        `Miles: ${Math.floor(miles_traveled).toString().padStart(3)}, ` +
        `Receipts: $${total_receipts_amount.toFixed(2).padStart(6)}, ` +
        `Output: $${case_.expected_output.toFixed(2).padStart(7)}`
      );
    });
  }

  public analyzeReceiptImpact(): void {
    console.log("\n=== RECEIPT IMPACT ANALYSIS ===");
    console.log("Looking for cases with similar trip parameters but different receipts...");

    // Group by (days, miles rounded to nearest 50)
    const similarTrips = new Map<string, ReimbursementCase[]>();
    this.cases.forEach(case_ => {
      const days = case_.input.trip_duration_days;
      const milesBucket = Math.round(case_.input.miles_traveled / 50) * 50;
      const key = `${days},${milesBucket}`;
      
      if (!similarTrips.has(key)) {
        similarTrips.set(key, []);
      }
      similarTrips.get(key)!.push(case_);
    });

    // Find groups with multiple cases
    similarTrips.forEach((cases, key) => {
      if (cases.length >= 3) {
        const [days, milesBucket] = key.split(',').map(Number);
        if (days <= 5) { // Focus on shorter trips
          console.log(`\n${days} days, ~${milesBucket} miles:`);
          cases
            .sort((a, b) => a.input.total_receipts_amount - b.input.total_receipts_amount)
            .forEach(case_ => {
              const { miles_traveled, total_receipts_amount } = case_.input;
              console.log(
                `  Miles: ${Math.floor(miles_traveled).toString().padStart(3)}, ` +
                `Receipts: $${total_receipts_amount.toFixed(2).padStart(7)}, ` +
                `Output: $${case_.expected_output.toFixed(2).padStart(7)}`
              );
            });
        }
      }
    });
  }

  public analyzeEfficiencyBonus(): EfficiencyAnalysis[] {
    console.log("\n=== EFFICIENCY BONUS ANALYSIS ===");
    
    // Calculate efficiency for each case
    const efficiencyData = this.cases.map(case_ => ({
      efficiency: case_.input.miles_traveled / case_.input.trip_duration_days,
      case: case_
    }));

    // Group by efficiency ranges (nearest 25)
    const efficiencyBuckets = new Map<number, typeof efficiencyData>();
    efficiencyData.forEach(({ efficiency, case: case_ }) => {
      const bucket = Math.round(efficiency / 25) * 25;
      if (!efficiencyBuckets.has(bucket)) {
        efficiencyBuckets.set(bucket, []);
      }
      efficiencyBuckets.get(bucket)!.push({ efficiency, case: case_ });
    });

    // Calculate statistics for each bucket
    const analysis: EfficiencyAnalysis[] = [];
    efficiencyBuckets.forEach((cases, bucket) => {
      if (cases.length >= 5) { // Only buckets with enough data
        const avgOutputPerDay = this.calculateMean(
          cases.map(({ case: case_ }) => 
            case_.expected_output / case_.input.trip_duration_days
          )
        );
        analysis.push({
          bucket,
          caseCount: cases.length,
          averageOutputPerDay: avgOutputPerDay
        });
      }
    });

    // Print results
    console.log("Efficiency (miles/day) vs Average Output per Day");
    analysis
      .sort((a, b) => a.bucket - b.bucket)
      .forEach(({ bucket, caseCount, averageOutputPerDay }) => {
        console.log(
          `${bucket.toString().padStart(3)} mi/day: ` +
          `${caseCount.toString().padStart(3)} cases, ` +
          `avg $${averageOutputPerDay.toFixed(2)}/day`
        );
      });

    return analysis;
  }

  public analyzeFiveDayTripsDetailed(): void {
    console.log("\n=== 5-DAY TRIP DETAILED ANALYSIS ===");
    console.log("Looking for the 5-day bonus pattern...");

    const fiveDayTrips = this.cases
      .filter(case_ => case_.input.trip_duration_days === 5)
      .sort((a, b) => 
        (a.input.miles_traveled / 5) - (b.input.miles_traveled / 5)
      );

    fiveDayTrips.slice(0, 15).forEach(case_ => {
      const { miles_traveled, total_receipts_amount } = case_.input;
      const efficiency = miles_traveled / 5;
      const receiptsPerDay = total_receipts_amount / 5;
      console.log(
        `Miles: ${Math.floor(miles_traveled).toString().padStart(3)} ` +
        `(${efficiency.toFixed(1).padStart(5)}/day), ` +
        `Receipts: $${total_receipts_amount.toFixed(2).padStart(7)} ` +
        `($${receiptsPerDay.toFixed(2).padStart(5)}/day), ` +
        `Output: $${case_.expected_output.toFixed(2).padStart(7)}`
      );
    });
  }

  public printAnalysis(): void {
    console.log(`Total cases: ${this.cases.length}\n`);

    console.log("=== PER-DAY ANALYSIS ===");
    this.analyzeByDuration().forEach(analysis => {
      console.log(
        `${analysis.days} days: ${analysis.caseCount} cases, ` +
        `avg output: $${analysis.averageOutput.toFixed(2)}, ` +
        `avg per day: $${analysis.averagePerDay.toFixed(2)}`
      );

      if (analysis.examples.length <= 5) {
        analysis.examples.forEach(case_ => {
          const { trip_duration_days, miles_traveled, total_receipts_amount } = case_.input;
          console.log(
            `  Days: ${trip_duration_days}, Miles: ${miles_traveled}, ` +
            `Receipts: $${total_receipts_amount.toFixed(2)}, ` +
            `Output: $${case_.expected_output.toFixed(2)}`
          );
        });
      }
    });

    console.log("\n=== 1-DAY TRIP ANALYSIS ===");
    this.analyzeOneDayTrips().forEach(analysis => {
      console.log(
        `Miles: ${analysis.miles}, Receipts: $${analysis.receipts.toFixed(2)}, ` +
        `Output: $${analysis.output.toFixed(2)}, ` +
        `Implied rate: $${analysis.impliedRate.toFixed(3)}/mile`
      );
    });

    console.log("\n=== 5-DAY TRIP ANALYSIS ===");
    this.analyzeFiveDayTrips().forEach(analysis => {
      console.log(
        `Miles: ${analysis.miles}, Receipts: $${analysis.receipts.toFixed(2)}, ` +
        `Output: $${analysis.output.toFixed(2)}, ` +
        `Bonus over base: $${analysis.bonusOverBase.toFixed(2)}, ` +
        `Efficiency: ${analysis.efficiency.toFixed(1)} mi/day`
      );
    });

    // New detailed analyses
    this.analyzeMileageTiers();
    this.analyzeReceiptImpact();
    this.analyzeEfficiencyBonus();
    this.analyzeFiveDayTripsDetailed();
  }
}

// Main execution
function main() {
  try {
    const publicCasesPath = path.join(__dirname, '..', 'public_cases.json');
    const data = JSON.parse(fs.readFileSync(publicCasesPath, 'utf8'));
    const analyzer = new ReimbursementAnalyzer(data);
    analyzer.printAnalysis();
  } catch (error) {
    console.error('Error analyzing data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { ReimbursementAnalyzer, ReimbursementCase }; 