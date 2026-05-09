import { useState } from "react";
import { Box, Container } from "@mui/material";
import { fetchGameOfTheDay } from "./api/gotdApi";
import { LoadingState } from "./components/LoadingState";
import LandingPage from "./pages/LandingPage";

import BuildPasswordGame from "./games/BuildPasswordGame";
import SpotWeakestGame from "./games/SpotWeakestGame";
import BuildPassphraseGame from "./games/BuildPassphraseGame";
import PhishingGame from "./games/PhishingGame";
import MultipleChoiceGame from "./games/MultipleChoiceGame";
import CookieBannersGame from "./games/cookie/CookieBannersGame";

import type {
  GameOfTheDay,
  BuildPasswordQuestion,
  SpotWeakestQuestion,
  BuildPassphraseQuestion,
  PhishOrLegitQuestion,
  MultipleChoiceQuestion,
} from "./api/types";

type AppState =
  | { view: "landing" }
  | { view: "loading" }
  | { view: "error"; message: string }
  | { view: "game"; game: GameOfTheDay };

export default function App() {
  const [state, setState] = useState<AppState>({ view: "landing" });

  const loadGame = async () => {
    setState({ view: "loading" });
    try {
      const game = await fetchGameOfTheDay();
      setState({ view: "game", game });
    } catch (err) {
      setState({ view: "error", message: String(err) });
    }
  };

  const goHome = () => setState({ view: "landing" });

  const renderGame = (game: GameOfTheDay) => {
    const { date, question_type, questions } = game;
    console.log("Rendering game:", question_type, questions);
    switch (question_type) {
      case "build_a_password":
        return (
          <BuildPasswordGame
            questions={questions as BuildPasswordQuestion[]}
            date={date}
            onBack={goHome}
          />
        );

      case "spot_the_weakest_password":
        return (
          <SpotWeakestGame
            questions={questions as SpotWeakestQuestion[]}
            date={date}
            onBack={goHome}
          />
        );

      case "build_a_passphrase":
        return (
          <BuildPassphraseGame
            questions={questions as BuildPassphraseQuestion[]}
            date={date}
            onBack={goHome}
          />
        );

      case "phish_or_legit":
        return (
          <PhishingGame
            questions={questions as PhishOrLegitQuestion[]}
            date={date}
            onBack={goHome}
          />
        );

      case "multiple_choice":
        return (
          <MultipleChoiceGame
            questions={questions as MultipleChoiceQuestion[]}
            date={date}
            onBack={goHome}
          />
        );

      case "cookie_banners":
        // Cookie game is frontend-only — backend only provides date + question_type
        return <CookieBannersGame date={date} onBack={goHome} />;

      default:
        return <LandingPage onPlay={loadGame} />;
    }
  };

  if (state.view === "landing") return <LandingPage onPlay={loadGame} />;

  if (state.view === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="sm">
          <LoadingState status="loading" minHeight={280} />
        </Container>
      </Box>
    );
  }

  if (state.view === "error") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="sm">
          <LoadingState
            status="error"
            error={state.message}
            onRetry={loadGame}
            minHeight={280}
          />
        </Container>
      </Box>
    );
  }

  return <>{renderGame(state.game)}</>;
}
