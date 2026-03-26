/* eslint-env jest */
// Vitest uses the same globals as Jest
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../pages/Login";
import axios from "axios";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock axios
vi.mock("axios");

describe("Login Page", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("renders login form with username, password, and submit button", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("password input should have type password", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "password");
  });

  test("validates required fields", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const submitButton = screen.getByRole("button", { name: /login/i });
    userEvent.click(submitButton);
    expect(await screen.findAllByText(/required/i)).toHaveLength(2);
  });

  test("displays error message when login fails", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/username/i), "testuser");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpassword");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test("successful login stores JWT and role, redirects to home", async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: "fake-jwt", role: "admin" },
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/username/i), "admin");
    await userEvent.type(screen.getByLabelText(/password/i), "admin123");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("fake-jwt");
      expect(localStorage.getItem("role")).toBe("admin");
    });

    expect(screen.getByText(/home page/i)).toBeInTheDocument();
  });
});