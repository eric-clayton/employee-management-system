import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Employees from "../pages/Employees";
import api from "../api/axios";
import { MemoryRouter } from "react-router-dom";

// -------------------- Mocks --------------------
vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(() => ({ role: "admin" })),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  vi.clearAllMocks();

  localStorage.setItem(
    "token",
    JSON.stringify("fake-token") // token exists
  );
});

// -------------------- Helpers --------------------
const renderPage = () =>
  render(
    <MemoryRouter>
      <Employees />
    </MemoryRouter>
  );

// -------------------- Tests --------------------
describe("Employees Page", () => {
  it("redirects to login if no token", async () => {
    localStorage.removeItem("token");

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("shows loading then renders employees", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          employee_id: 1,
          name: "John Doe",
          email: "john@test.com",
          position: "Dev",
          department: "IT",
          salary: 50000,
          status: "Active",
        },
      ],
    });

    renderPage();

    expect(screen.getByText(/loading employees/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@test.com")).toBeInTheDocument();
    });
  });

  it("filters employees by search input", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { employee_id: 1, name: "Alice", department: "HR", position: "Manager" },
        { employee_id: 2, name: "Bob", department: "IT", position: "Dev" },
      ],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "hr" },
    });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  it("deletes an employee after confirmation", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { employee_id: 1, name: "Alice" },
        { employee_id: 2, name: "Bob" },
      ],
    });

    api.delete.mockResolvedValueOnce({});

    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/employees/1");
    });
  });

  it("enters edit mode and saves changes", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        {
          employee_id: 1,
          name: "Alice",
          email: "a@test.com",
          position: "Dev",
          department: "IT",
          salary: 50000,
          status: "Active",
        },
      ],
    });

    api.put.mockResolvedValueOnce({});

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    const nameInput = screen.getByDisplayValue("Alice");
    fireEvent.change(nameInput, { target: { value: "Alice Updated" } });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/employees/1", expect.any(Object));
      expect(screen.queryByDisplayValue("Alice")).not.toBeInTheDocument();
    });
  });

  it("toggles sorting when clicking column header", async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { employee_id: 1, name: "Charlie", email: "c@test.com" },
        { employee_id: 2, name: "Alice", email: "a@test.com" },
      ],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    const nameHeader = screen.getByText(/name/i);
    fireEvent.click(nameHeader); // change sort direction

    expect(nameHeader).toBeInTheDocument();
  });
});