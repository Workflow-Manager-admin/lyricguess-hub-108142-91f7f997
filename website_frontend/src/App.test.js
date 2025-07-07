import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mocks for backend endpoints
const mockFetch = (url) => {
  if (url.includes('/api/game/random-track')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          track: { artist: "Adele", title: "Someone Like You" },
          choices: [
            { artist: "Adele", title: "Someone Like You", correct: true },
            { artist: "Queen", title: "Bohemian Rhapsody", correct: false },
            { artist: "The Beatles", title: "Hey Jude", correct: false }
          ]
        }),
    });
  }
  return Promise.reject(new Error(`Unknown fetch mock for ${url}`));
};

describe("Integration: Song Guessing Game", () => {
  let origFetch;
  beforeAll(() => {
    origFetch = global.fetch;
    global.fetch = jest.fn().mockImplementation(mockFetch);
  });
  afterAll(() => {
    global.fetch = origFetch;
  });

  test("fetches choices from backend and allows correct selection", async () => {
    render(<App />);

    // Wait for backend fetch and rendering (choices)
    expect(await screen.findByText(/Listen to the audio preview/i)).toBeInTheDocument();
    // All answer buttons (song choices) should be rendered
    expect(screen.getByRole("button", { name: /Someone Like You/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Bohemian Rhapsody/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Hey Jude/ })).toBeInTheDocument();

    // Preview link points to a URL containing the track info
    expect(screen.getByRole("link", { name: /Listen to preview/ })).toHaveAttribute("href", expect.stringContaining("Adele"));

    // Select a wrong answer
    const wrongBtn = screen.getByRole("button", { name: /Bohemian Rhapsody/ });
    fireEvent.click(wrongBtn);

    await waitFor(() => {
      expect(screen.getByText(/Not quite. Try again/i)).toBeInTheDocument();
    });

    // Select the correct answer
    const correctBtn = screen.getByRole("button", { name: /Someone Like You/ });
    fireEvent.click(correctBtn);

    await waitFor(() => {
      expect(screen.getByText(/Correct! Nice guess/i)).toBeInTheDocument();
      // Reveal section shown
      expect(screen.getByText(/The song/)).toBeInTheDocument();
      expect(screen.getByText(/Adele/)).toBeInTheDocument();
    });
  });
});
