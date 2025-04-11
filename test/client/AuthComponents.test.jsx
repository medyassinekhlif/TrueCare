import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InsurerLogin from '../../src/components/InsurerLogin'; // Adjust path
import DoctorLogin from '../../src/components/DoctorLogin'; // Adjust path

describe('Auth Component Tests', () => {
  test('Insurer Login renders correctly and toggles to signup mode', () => {
    render(
      <BrowserRouter>
        <InsurerLogin />
      </BrowserRouter>
    );

    // Check initial render
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up here/i)).toBeInTheDocument();

    // Toggle to signup
    fireEvent.click(screen.getByText(/Sign up here/i));
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Company Name/i)).toBeInTheDocument();
  });

  test('Doctor Login renders correctly and toggles to signup mode', () => {
    render(
      <BrowserRouter>
        <DoctorLogin />
      </BrowserRouter>
    );

    // Check initial render
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up here/i)).toBeInTheDocument();

    // Toggle to signup
    fireEvent.click(screen.getByText(/Sign up here/i));
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Specialty/i)).toBeInTheDocument();
  });
});
