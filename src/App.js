import React, { Component } from "react";
import {
  Box,
  Grommet,
  ResponsiveContext,
} from "grommet";
import { hpe } from "grommet-theme-hpe";
import AppHeader from "./components/AppHeader";
import AppFooter from "./components/AppFooter";
import AppRouting from "./routes/AppRouting";

class App extends Component {
  render() {
    return (
      <Grommet theme={hpe} full>
        <ResponsiveContext.Consumer>
          {size => (
            <Box fill style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
              <AppHeader />
              <Box flex overflow={{ vertical: 'auto', horizontal: 'hidden' }}>
                <AppRouting />
              </Box>
              <AppFooter />
            </Box>
          )}
        </ResponsiveContext.Consumer>
      </Grommet>
    );
  }
}

export default App;
