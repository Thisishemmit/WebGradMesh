export interface StyleConfig {
    default: {
        fill: string;
        stroke: string;
        strokeWidth: number;
    };

    hover: {
        fill: string;
        stroke: string;
        strokeWidth: number;
    };

    select: {
        fill: string;
        stroke: string;
        strokeWidth: number
    };
}

export enum InteractState {
    default = 'default',
    hover = 'hover',
    select = 'select'
}
