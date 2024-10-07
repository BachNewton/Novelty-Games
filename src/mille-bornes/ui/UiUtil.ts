import { Team } from "../logic/Data";

export function addHighlight(style: React.CSSProperties) {
    style.borderColor = 'yellow';
    style.borderWidth = '3px';
    style.borderStyle = 'solid';
    style.boxSizing = 'border-box';
}

export function getTeamName(team: Team): string {
    return 'Team ' + team.players.map(player => player.name).join(' & ');
};
