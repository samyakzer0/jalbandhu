import { submitReport } from './services/ReportService';

// Test data for duplicate reports - all within 100m radius of each other
const testDuplicateReports = [
  {
    title: "Pothole on Main Street near Central Park",
    description: "Large pothole causing traffic hazard and potential vehicle damage. Located on Main Street approximately 50 meters from Central Park entrance. The pothole is about 2 feet wide and 6 inches deep.",
    category: "Roads",
    location: {
      lat: 28.6139, // Delhi coordinates
      lng: 77.2090,
      address: "Main Street near Central Park, Delhi",
      city: "Delhi"
    },
    priority: "High" as const,
    imageData: null
  },
  {
    title: "Dangerous Pothole on Main Road",
    description: "There's a very deep pothole on Main Street close to Central Park. It's been there for weeks and is getting worse. Cars are having trouble avoiding it and it's a safety risk for pedestrians too.",
    category: "Roads",
    location: {
      lat: 28.6140, // Very close to first report (about 10m away)
      lng: 77.2091,
      address: "Main Road near Central Park entrance, Delhi",
      city: "Delhi"
    },
    priority: "High" as const,
    imageData: null
  },
  {
    title: "Road Damage Near Central Park",
    description: "Significant road damage with large potholes on Main Street. The surface is broken and poses danger to vehicles. Located right near the Central Park area in Delhi.",
    category: "Roads",
    location: {
      lat: 28.6138, // About 20m from first report
      lng: 77.2089,
      address: "Main Street by Central Park, Delhi",
      city: "Delhi"
    },
    priority: "Medium" as const,
    imageData: null
  }
];

async function createTestDuplicateReports() {
  console.log('Creating test duplicate reports for the duplicate detection system...');

  for (let i = 0; i < testDuplicateReports.length; i++) {
    const report = testDuplicateReports[i];
    try {
      console.log(`\nSubmitting report ${i + 1}: ${report.title}`);
      const result = await submitReport(
        report.title,
        report.description,
        report.category,
        report.location,
        report.imageData,
        'test_user_' + (i + 1),
        report.priority
      );

      if (result.success) {
        console.log(`✅ Report ${i + 1} created successfully: ${result.report_id}`);
      } else {
        console.error(`❌ Failed to create report ${i + 1}:`, result.message);
      }
    } catch (error) {
      console.error(`❌ Error creating report ${i + 1}:`, error);
    }

    // Small delay between submissions to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎯 Test duplicate reports creation completed!');
  console.log('These reports should be detected as duplicates by the grouping system.');
  console.log('Check the admin dashboard to see if they are grouped together.');
}

createTestDuplicateReports().catch(console.error);