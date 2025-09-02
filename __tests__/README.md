# Interactive 3D Logo Test Suite

This comprehensive test suite validates the interactive 3D logo functionality, ensuring proper mouse tracking, lightning effects, performance optimization, and visual consistency.

## Test Structure

### 1. Component Tests (`components/`)
- **ThreeScene.test.tsx**: Main component integration tests
  - Component rendering and initialization
  - Mouse and touch event handling
  - Responsive behavior validation
  - Canvas creation and WebGL context

### 2. Unit Tests (`utils/`)
- **mouseTracking.test.ts**: Mouse coordinate conversion functions
  - Screen to normalized coordinate conversion
  - Normalized to world coordinate conversion
  - Mouse sensitivity calculations
  - Position smoothing algorithms

### 3. Lightning System Tests (`components/lightning/`)
- **LightningSystem.test.ts**: Lightning generation and management
  - Lightning bolt creation and path generation
  - Lightning pool management and memory optimization
  - Trigger rate limiting and performance controls
  - Animation lifecycle and cleanup

### 4. Performance Tests (`performance/`)
- **PerformanceTests.test.ts**: FPS monitoring and optimization
  - Frame rate monitoring and calculation
  - Adaptive quality system validation
  - Geometry pooling efficiency tests
  - Memory usage optimization verification

### 5. Visual Regression Tests (`visual/`)
- **VisualRegressionTests.test.ts**: Visual consistency validation
  - Lightning effect rendering verification
  - Bloom effect quality assurance
  - Cross-browser visual consistency
  - Performance-based quality adaptation

## Test Categories

### Unit Tests
Focus on individual functions and utilities:
- Mouse coordinate conversion accuracy
- Lightning path generation algorithms
- Performance monitoring calculations
- Geometry pooling efficiency

### Integration Tests
Test component interactions:
- Lightning system triggering from mouse events
- Performance adaptation affecting visual quality
- Responsive design with lightning effects
- Error handling and recovery

### Performance Tests
Validate performance requirements:
- Maintain 60 FPS target under normal load
- Adaptive quality system responds to performance drops
- Memory usage stays within acceptable limits
- Geometry pooling reduces allocation overhead

### Visual Tests
Ensure consistent visual output:
- Lightning effects render correctly
- Bloom effects maintain quality
- Visual consistency across different scenarios
- Performance-based quality scaling works properly

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Categories
```bash
# Performance tests only
npm run test:performance

# Visual regression tests only
npm run test:visual

# Integration tests only
npm run test:integration
```

### Test Modes
```bash
# Watch mode for development
npm run test:watch

# Single run with coverage
npm run test:coverage

# Interactive UI mode
npm run test:ui
```

## Test Configuration

### Performance Thresholds
- **Target FPS**: 60 FPS under normal conditions
- **Minimum FPS**: 30 FPS under heavy load
- **Memory Usage**: < 100MB for lightning system
- **Geometry Pool Reuse**: > 70% reuse ratio

### Visual Tolerances
- **Pixel Difference**: < 5 units per pixel for regression tests
- **Different Pixels**: < 5% of total pixels for consistency tests
- **Bloom Variance**: < 10% variance in bloom intensity effects

### Coverage Requirements
- **Lines**: 70% minimum coverage
- **Functions**: 70% minimum coverage
- **Branches**: 70% minimum coverage
- **Statements**: 70% minimum coverage

## Test Data and Mocks

### Mocked Dependencies
- **Three.js**: Complete Three.js library mock for unit testing
- **WebGL Context**: Mock WebGL rendering context
- **Canvas API**: Mock 2D canvas context for visual tests
- **Performance API**: Mock performance monitoring APIs
- **Animation Frame**: Mock requestAnimationFrame for controlled timing

### Test Utilities
- **Performance Measurement**: Utilities for measuring execution time
- **Visual Comparison**: Pixel-level image comparison tools
- **Event Simulation**: Mouse and touch event simulation helpers
- **Mock Data Generation**: Random test data generators

## Continuous Integration

### Pre-commit Hooks
Tests run automatically before commits to ensure:
- All tests pass
- Performance benchmarks are met
- Visual regression tests validate
- Code coverage thresholds are maintained

### Build Pipeline
- Unit tests run on every pull request
- Performance tests validate on staging deployments
- Visual regression tests run on release candidates
- Coverage reports generated for all builds

## Debugging Tests

### Test Debugging
```bash
# Run specific test file
npx vitest __tests__/components/home/ThreeScene.test.tsx

# Run with debug output
npx vitest --reporter=verbose

# Run single test case
npx vitest -t "should handle mouse move events"
```

### Performance Debugging
```bash
# Run performance tests with detailed output
npm run test:performance -- --reporter=verbose

# Generate performance benchmark reports
npx vitest run __tests__/performance/ --reporter=json
```

### Visual Debugging
```bash
# Run visual tests with snapshot output
npm run test:visual -- --reporter=verbose

# Generate visual comparison reports
npx vitest run __tests__/visual/ --reporter=html
```

## Test Maintenance

### Adding New Tests
1. Follow existing test structure and naming conventions
2. Include appropriate mocks and setup
3. Add performance benchmarks for new features
4. Include visual regression tests for UI changes
5. Update coverage thresholds if needed

### Updating Baselines
- Visual regression baselines should be updated when intentional changes are made
- Performance benchmarks should be adjusted for hardware improvements
- Test tolerances may need adjustment for different environments

### Test Environment
- Tests run in jsdom environment for DOM simulation
- WebGL context is mocked for consistent behavior
- Performance timing is controlled for reproducible results
- Random number generation is seeded for consistent test data