import { createHashHistory } from "history";
import { applyMiddleware, compose, createStore } from "redux";
import { routerMiddleware } from "connected-react-router";
import rootReducer from "@Redux/Reducers/index";

export const history = createHashHistory({
  basename: ""
});

export default function configureStore(preloadedState) {
  const store = createStore(
    rootReducer(history),
    preloadedState,
    compose(
      applyMiddleware(
        routerMiddleware(history)
        // ... other middlewares ...
      )
    )
  );

  return store;
}
