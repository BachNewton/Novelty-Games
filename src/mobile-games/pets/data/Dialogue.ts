export interface Dialogue {
    hidden: string;
    greeting: Greeting;
    sleeping: string;
}

interface Greeting {
    lowFriendship: string;
    highFriendship: string;
}

export const frogDialog: Dialogue = {
    hidden: "What a great place to nap and chatter at birds! But there's a bit too many people here. Come find me and bring me back to my kingdom!",
    greeting: {
        lowFriendship: "Hello, my name is the Frog Princess Buttercup, but you can just call me Frog. We can hangout but don't get too close just yet, I might bite you! If you treat me like the princess that I am, then maybe we can become friends.",
        highFriendship: "It's so nice just sitting next to you. I find myself purring all the time, I can't help it! I'll accompany anywhere in the world! Seriously, I've lived a lot of places. Let me know if you ever wanna get some milk and look at birds with me!"
    },
    sleeping: "Can you come back later? I've found the perfect quiet place in the sun and I don't want to be disturbed. It's so comfortable here, but I'll leave if I hear a baby cry."
};

export const ziggyDialog: Dialogue = {
    hidden: "Ziggy hidden",
    greeting: {
        lowFriendship: "Ziggy low friendship",
        highFriendship: "Ziggy high friendship"
    },
    sleeping: "Ziggy sleeping"
};

export const baxterDialog: Dialogue = {
    hidden: "Baxter hidden",
    greeting: {
        lowFriendship: "Baxter low friendship",
        highFriendship: "Baxter high friendship"
    },
    sleeping: "Baxter sleeping"
};
