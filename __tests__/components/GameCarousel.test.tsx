import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import GameCarousel from '../../components/GameCarousel';

// Mock ResizeObserver
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
window.ResizeObserver = ResizeObserver;

const smoothScrollByMock = vi.fn();

// Mock the smoothScrollBy function within the module
vi.mock('../../components/GameCarousel', async () => {
    const original = await vi.importActual('../../components/GameCarousel');
    return {
        ...original,
        __esModule: true,
        default: original.default,
    };
});


describe('GameCarousel', () => {
    // Reset mocks before each test
    beforeEach(() => {
        smoothScrollByMock.mockClear();
    });

    it('should enable the "Next" button when content is slightly wider than the container', () => {
        const mockContainerWidth = 500;
        const mockContentWidth = 501; // Only 1px wider

        render(
            <GameCarousel>
                <div style={{ width: `${mockContentWidth}px` }}>Child Content</div>
            </GameCarousel>
        );

        const scrollContainer = screen.getByTestId('scroll-container');
        Object.defineProperty(scrollContainer, 'clientWidth', { value: mockContainerWidth });
        Object.defineProperty(scrollContainer, 'scrollWidth', { value: mockContentWidth });
        Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, writable: true });

        // Manually trigger a scroll event to run checkScrollPosition
        fireEvent.scroll(scrollContainer);

        const nextButton = screen.getByLabelText('Next slide');
        expect(nextButton).not.toBeDisabled();
    });
});
