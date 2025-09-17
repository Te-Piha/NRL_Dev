import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from '../App';
import store from '../redux/store';

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue([]),
  });
});

afterEach(() => {
  jest.resetAllMocks();
  delete global.fetch;
});

test('renders navigation links', async () => {
  const { unmount } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(await screen.findByText(/Player Database/i)).toBeInTheDocument();
  expect(screen.getByText(/Build Team/i)).toBeInTheDocument();
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  unmount();
});
