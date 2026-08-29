import { Component } from "react";

import { CrashScreen } from "./CrashScreen";

// Le seul endroit du projet ou une classe se justifie : React n'offre pas
// d'equivalent en crochet. Sans elle, une erreur de rendu laisse une page
// blanche sans un mot, y compris quand elle vient d'un fournisseur.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error, info) {
    console.error("Rendu interrompu", error, info?.componentStack);
  }

  render() {
    return this.state.crashed ? <CrashScreen /> : this.props.children;
  }
}
