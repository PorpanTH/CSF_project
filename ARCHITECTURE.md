# Portfolio Manager Architecture Document

## 1. Overview

This project implements a portfolio management web application with a clear separation between a frontend user interface and a backend API. The system is designed as a layered client-server application, where the React frontend communicates with a Flask backend over HTTP to manage portfolios, holdings, transactions, and market data.

## 2. Architectural Style

The application follows a layered architecture with a modular monolith approach:

- The frontend is a single-page application built with React and TypeScript.
- The backend is a Flask-based service exposing REST endpoints.
- Business logic and persistence are handled server-side.
- The system is composed of distinct layers rather than a tightly coupled implementation.

This style is appropriate for a project of this size because it balances maintainability, simplicity, and extensibility without introducing the overhead of full microservices.

## 3. High-Level System Architecture

The project uses a layered architecture in which each folder in the codebase plays a specific role. The important point is that the layers are not just conceptual; they are reflected in the repository structure.

### 3.1 Presentation Layer: [portfolio-frontend/src](portfolio-frontend/src)
This layer contains the user-facing application. It is the top-most layer in the system and is responsible for presenting portfolio data to the user and collecting user actions.

More specifically:
- [portfolio-frontend/src/App.tsx](portfolio-frontend/src/App.tsx) acts as the main application container. It coordinates the dashboard, trade flows, transaction history, and portfolio loading logic.
- [portfolio-frontend/src/components](portfolio-frontend/src/components) is the UI component layer. It contains all the reusable components for rendering the dashboard, charts, forms, headers, modals, and transaction screens.
- [portfolio-frontend/src/services](portfolio-frontend/src/services) is the API integration layer of the frontend. It contains the logic that calls the Flask backend endpoints for portfolios, market data, and transactions.
- [portfolio-frontend/src/types.ts](portfolio-frontend/src/types.ts) is the shared data contract layer for the frontend. It defines the TypeScript structures used throughout the app, such as portfolio items, metrics, and transaction records.

This layer is therefore not just “the UI”; it is the presentation and interaction layer that consumes the backend services and renders the business data in a usable form.

### 3.2 Application Layer: [portfolio-backend/routes](portfolio-backend/routes)
This layer sits directly below the presentation layer and acts as the HTTP-facing application layer of the backend. It is responsible for receiving requests from the frontend and translating them into backend operations.

More specifically:
- [portfolio-backend/routes/portfolios.py](portfolio-backend/routes/portfolios.py) contains the portfolio endpoints for creating portfolios, getting portfolio details, adding or removing holdings, and recording buy/sell transactions.
- [portfolio-backend/routes/auth.py](portfolio-backend/routes/auth.py) contains the authentication-related routes, including the endpoint for retrieving the current user context.
- [portfolio-backend/routes/market.py](portfolio-backend/routes/market.py) contains the endpoints that expose market-related functionality such as symbol search and live quote retrieval.

This layer is the API boundary of the application. It receives requests from the React frontend, validates them at a basic level, and forwards the work to the lower layers.

### 3.3 Business Logic Layer: [portfolio-backend/services](portfolio-backend/services)
Below the route layer is the service layer, which contains the reusable business logic that is not tied to a single HTTP request.

More specifically:
- [portfolio-backend/services/nav_history.py](portfolio-backend/services/nav_history.py) handles NAV snapshot recording, historical NAV retrieval, and P/L calculations over time.
- [portfolio-backend/services/symbol_directory.py](portfolio-backend/services/symbol_directory.py) implements the symbol lookup and market metadata search logic used by the market API.
- [portfolio-backend/services/Portfolio_Services.py](portfolio-backend/services/Portfolio_Services.py) provides a service-oriented abstraction around portfolio item operations.

This layer is where core domain rules are implemented. It separates application rules from the route handlers so the logic can be reused and maintained independently of HTTP concerns.

### 3.4 Domain Model Layer: [portfolio-backend/models](portfolio-backend/models)
This layer contains the domain objects of the application. These are the core entities that represent the business concepts in the system.

More specifically:
- [portfolio-backend/models/portfolio.py](portfolio-backend/models/portfolio.py) defines the portfolio-related entities, including Portfolio, PortfolioItem, PortfolioNavHistory, and TransactionHistory.
- [portfolio-backend/models/user.py](portfolio-backend/models/user.py) defines the user entity used by the authentication flow.

These models do more than store data. They also encapsulate important behavior such as portfolio metric calculation and serialization into API-friendly structures.

### 3.5 Persistence Layer: [portfolio-backend/database](portfolio-backend/database) and [portfolio-backend/repository](portfolio-backend/repository)
This is the foundation layer responsible for storing and retrieving data.

More specifically:
- [portfolio-backend/database/db.py](portfolio-backend/database/db.py) creates and centralizes the SQLAlchemy database instance used by the application.
- [portfolio-backend/models](portfolio-backend/models) uses SQLAlchemy ORM mappings to define how application objects are stored in the database.
- [portfolio-backend/repository/Portfolio_Repository.py](portfolio-backend/repository/Portfolio_Repository.py) provides repository-style access for portfolio item persistence and retrieval.

This layer is the lowest level of the architecture. It abstracts database access so the upper layers do not need to deal directly with persistence concerns.

### 3.6 Bootstrap Layer: [portfolio-backend/controller](portfolio-backend/controller)
This layer is responsible for starting the application and wiring together all the other layers.

More specifically:
- [portfolio-backend/controller/app.py](portfolio-backend/controller/app.py) initializes the Flask app, configures middleware and logging, registers the route blueprints, sets up database connectivity, and starts background tasks such as NAV snapshot scheduling.

In architectural terms, this layer acts as the composition root. It brings the route, service, model, and persistence layers together into a working application.

## 4. Frontend Architecture

### 4.1 Structure
The frontend is organized by feature and responsibility:

- Components: reusable UI elements such as charts, cards, forms, and dialogs
- Services: API integration logic
- Types: shared TypeScript interfaces for domain entities
- Styling: Tailwind CSS-based visual design

### 4.2 Main Frontend Components

- App shell and routing entry point:
  - [portfolio-frontend/src/main.tsx](portfolio-frontend/src/main.tsx)
  - [portfolio-frontend/src/App.tsx](portfolio-frontend/src/App.tsx)

- UI components:
  - [portfolio-frontend/src/components/Header.tsx](portfolio-frontend/src/components/Header.tsx)
  - [portfolio-frontend/src/components/AddFlow.tsx](portfolio-frontend/src/components/AddFlow.tsx)
  - [portfolio-frontend/src/components/RemoveFlow.tsx](portfolio-frontend/src/components/RemoveFlow.tsx)
  - [portfolio-frontend/src/components/TradeModal.tsx](portfolio-frontend/src/components/TradeModal.tsx)
  - [portfolio-frontend/src/components/TransactionHistoryScreen.tsx](portfolio-frontend/src/components/TransactionHistoryScreen.tsx)

- Charts and analytics views:
  - [portfolio-frontend/src/components/PnLOverview.tsx](portfolio-frontend/src/components/PnLOverview.tsx)
  - [portfolio-frontend/src/components/AssetAllocationChart.tsx](portfolio-frontend/src/components/AssetAllocationChart.tsx)
  - [portfolio-frontend/src/components/TimeWeightedReturnChart.tsx](portfolio-frontend/src/components/TimeWeightedReturnChart.tsx)

### 4.3 Frontend Design Approach
The frontend follows a component-driven architecture with a clear separation between:
- UI rendering
- state management via React hooks
- API communication via service modules

This makes the application easier to develop incrementally and test at the component level.

## 5. Backend Architecture

### 5.1 Application Bootstrap
The Flask application is initialized through an application factory pattern in [portfolio-backend/controller/app.py](portfolio-backend/controller/app.py).

The app startup process performs the following tasks:
- loads environment variables
- configures the Flask app
- initializes SQLAlchemy
- enables CORS for API access
- registers blueprints for API routes
- creates the database schema
- seeds default data if needed
- starts scheduled background tasks for NAV snapshots

### 5.2 Routing Layer
The backend routes are organized into blueprints:

- Authentication routes: [portfolio-backend/routes/auth.py](portfolio-backend/routes/auth.py)
- Portfolio routes: [portfolio-backend/routes/portfolios.py](portfolio-backend/routes/portfolios.py)
- Market data routes: [portfolio-backend/routes/market.py](portfolio-backend/routes/market.py)

These blueprints separate concerns and keep the API surface organized.

### 5.3 Service Layer
The service layer contains the application’s core business logic.

Examples include:
- [portfolio-backend/services/nav_history.py](portfolio-backend/services/nav_history.py) for NAV snapshots and analytics
- [portfolio-backend/services/symbol_directory.py](portfolio-backend/services/symbol_directory.py) for symbol search and market metadata
- [portfolio-backend/services/Portfolio_Services.py](portfolio-backend/services/Portfolio_Services.py) for portfolio-related service orchestration

### 5.4 Domain Model Layer
Domain entities are modeled using SQLAlchemy in [portfolio-backend/models/portfolio.py](portfolio-backend/models/portfolio.py):

- Portfolio
- PortfolioItem
- PortfolioNavHistory
- TransactionHistory
- User

These models represent the core business concepts of the application.

### 5.5 Data Access Layer
The backend uses SQLAlchemy as the ORM and database abstraction layer.

Key database setup:
- [portfolio-backend/database/db.py](portfolio-backend/database/db.py)

The repository module [portfolio-backend/repository/Portfolio_Repository.py](portfolio-backend/repository/Portfolio_Repository.py) provides additional repository-style access for portfolio items.

## 6. Request Flow

A typical request follows this flow:

1. The user performs an action in the React UI.
2. The frontend calls a service method in [portfolio-frontend/src/services/api.ts](portfolio-frontend/src/services/api.ts).
3. The backend route in the Flask application receives the request.
4. The route delegates work to service or model logic.
5. The database is queried or updated through SQLAlchemy.
6. The response is returned to the frontend and displayed to the user.

## 7. Market Data Integration

The system integrates with external market data providers through the backend:

- yfinance is used to retrieve live price data for securities.
- A fallback symbol directory and mock quote data are used to improve resilience when live services are unavailable.

This is handled primarily in:
- [portfolio-backend/routes/market.py](portfolio-backend/routes/market.py)
- [portfolio-backend/services/symbol_directory.py](portfolio-backend/services/symbol_directory.py)

## 8. Analytics and Reporting

The backend calculates portfolio-level metrics such as:
- total cost
- current market value
- realized and unrealized P/L
- asset allocation breakdown
- NAV history over time

These computations are embedded in model methods and helper services and are exposed through API routes to the frontend dashboard.

## 9. Security and Reliability Considerations

The current implementation includes several practical design choices:

- CORS is enabled for frontend-backend communication.
- Logging is configured for requests, responses, and SQL activity.
- Background scheduling is used for NAV snapshots.
- Error handling middleware is included for common HTTP failures.

While the system is functional, it currently uses a relatively simple security model and does not yet include a full authentication framework beyond the default user concept.

## 10. Strengths of the Current Architecture

- Clear separation between frontend and backend
- Layered organization that is easy to follow
- Modular components for charts, forms, and routing
- Reusable service layer for API communication
- Good foundation for incremental enhancement

## 11. Areas for Improvement

Potential enhancements for future iterations:

- Introduce a more formal service layer for all backend business logic
- Move more logic out of routes into dedicated service classes
- Add proper authentication and authorization
- Introduce automated tests for API and UI behavior
- Consider containerization and deployment orchestration
- Potentially split the application into separate services if scale increases

## 12. Conclusion

The architecture of this project is a practical layered web application design that effectively separates the presentation layer, API layer, business logic, and persistence layer. It provides a strong foundation for a portfolio management application and is easy to expand as new features are added.
