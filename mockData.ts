export type AppUsage = {name: string; minutes: number};
export type Player = {id: string; name: string; apps: AppUsage[]};

export const me: Player = {
  id: 'me',
  name: 'Ben',
  apps: [
    {name: 'Instagram', minutes: 42},
    {name: 'YouTube', minutes: 31},
    {name: 'Messages', minutes: 18},
  ],
};

export const friend: Player = {
  id: 'friend',
  name: 'Alex',
  apps: [
    {name: 'TikTok', minutes: 64},
    {name: 'Instagram', minutes: 25},
    {name: 'Messages', minutes: 12},
  ],
};

export const jordan: Player = {
  id: 'jordan',
  name: 'Jordan',
  apps: [
    {name: 'YouTube', minutes: 80},
    {name: 'Reddit', minutes: 45},
    {name: 'Chrome', minutes: 22},
  ],
};