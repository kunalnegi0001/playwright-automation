# Test Report: orangehrm-dashboard-regression

Generated at: 2026-06-19T05:56:35.447Z

## Summary

- Total: 8
- Passed: 8
- Failed: 0
- Skipped: 0
- Timed Out: 0
- Duration (ms): 54925

## Test Cases

| # | Scenario Summary | Steps to Reproduce | Status | Duration (ms) | Project | File |
| --- | --- | --- | --- | ---: | --- | --- |
| 1 | src/tests/auth.setup.ts › authenticate | N/A | passed | 4910 | setup | src/tests/auth.setup.ts |
| 2 | OrangeHRM Dashboard › Quick Launch navigation - Assign Leave | 1. When I click the "Assign Leave" quick launch button<br/>2. Then the URL should contain "/leave/assignLeave" | passed | 6717 | bdd-examples | .features-gen/ui/examples/src/tests/UI/__examples-orangehrm__/dashboard/features/dashboard.feature.spec.js |
| 3 | OrangeHRM Dashboard › Quick Launch navigation - Leave List | 1. When I click the "Leave List" quick launch button<br/>2. Then the URL should contain "/leave/viewLeaveList" | passed | 7933 | bdd-examples | .features-gen/ui/examples/src/tests/UI/__examples-orangehrm__/dashboard/features/dashboard.feature.spec.js |
| 4 | OrangeHRM Dashboard › Quick Launch navigation - Apply Leave | 1. When I click the "Apply Leave" quick launch button<br/>2. Then the URL should contain "/leave/applyLeave" | passed | 6527 | bdd-examples | .features-gen/ui/examples/src/tests/UI/__examples-orangehrm__/dashboard/features/dashboard.feature.spec.js |
| 5 | OrangeHRM Dashboard › Quick Launch navigation - My Leave | 1. When I click the "My Leave" quick launch button<br/>2. Then the URL should contain "/leave" | passed | 8213 | bdd-examples | .features-gen/ui/examples/src/tests/UI/__examples-orangehrm__/dashboard/features/dashboard.feature.spec.js |
| 6 | OrangeHRM Dashboard › Quick Launch navigation - Timesheets | 1. When I click the "Timesheets" quick launch button<br/>2. Then the URL should contain "/time" | passed | 7020 | bdd-examples | .features-gen/ui/examples/src/tests/UI/__examples-orangehrm__/dashboard/features/dashboard.feature.spec.js |
| 7 | OrangeHRM Dashboard › Quick Launch navigation - My Timesheet | 1. When I click the "My Timesheet" quick launch button<br/>2. Then the URL should contain "/time" | passed | 7376 | bdd-examples | .features-gen/ui/examples/src/tests/UI/__examples-orangehrm__/dashboard/features/dashboard.feature.spec.js |
| 8 | OrangeHRM Dashboard › Sidebar search functionality | 1. When I type "Admin" in the sidebar search<br/>2. Then only matching sidebar items should be visible<br/>3. When I clear the sidebar search<br/>4. Then all 12 sidebar menu items should be visible<br/>5. When I type "Le" in the sidebar search<br/>6. And I click "Leave" from the filtered sidebar<br/>7. Then the URL should contain "/leave" | passed | 6229 | bdd-examples | .features-gen/ui/examples/src/tests/UI/__examples-orangehrm__/dashboard/features/dashboard.feature.spec.js |
