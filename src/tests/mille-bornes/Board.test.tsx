import { render } from "@testing-library/react";
import Board from "../../mille-bornes/ui/Board";
import { TESTIING_LOCAL_ID, createTestingGame } from "./TestingUtil";
import { Communicator } from "../../mille-bornes/logic/Communicator";

test('Board temp', () => {
    const game = createTestingGame();
    // const communicator = new Communicator();
    // const boardUi = <Board
    //     startingGame={game}
    //     localId={TESTIING_LOCAL_ID}
    //     communicator={communicator}
    //     onRoundOver={() => { }}
    // />;
    // render(boardUi);
});

export { };
