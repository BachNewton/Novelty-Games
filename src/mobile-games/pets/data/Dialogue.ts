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
    hidden: "I love how many dogs there are here! But where is my person? I like it best with my person. Come find me please!",
    greeting: {
        lowFriendship: "Hello! My name is Ziggy. I'm a little shy, and people are scary sometimes. I'll like you best if you let me sneak up and sniff you without you looking. But once I know you, I'll remember you for a really, really long time!",
        highFriendship: "I'm so excited! You're here! You're great! I have to go find a toy to chew about how excited I am! Will throw my toy for me? Please? Again?"
    },
    sleeping: "I'm sooooo tired. I had a really busy day of going outside, and then back inside, and sleeping, and playing, and sleeping again. You can hang out, but I'm too tired. So I'm going to lie on my back like a dead bug and snore now. "
};

export const baxterDialog: Dialogue = {
    hidden: "Baxter hidden",
    greeting: {
        lowFriendship: "Baxter low friendship",
        highFriendship: "Baxter high friendship"
    },
    sleeping: "Baxter sleeping"
};

export const ellaDialog: Dialogue = {
    hidden: "Ella hidden",
    greeting: {
        lowFriendship: "Ella low friendship",
        highFriendship: "Ella high friendship"
    },
    sleeping: "Ella sleeping"
};

export const doryDialog: Dialogue = {
    hidden: "Dory hidden",
    greeting: {
        lowFriendship: "Dory low friendship",
        highFriendship: "Dory high friendship"
    },
    sleeping: "Dory sleeping"
};

export const albyDialog: Dialogue = {
    hidden: "I'm gonna start howling like Baltimore any minute now!",
    greeting: {
        lowFriendship: "Hi, I'm Alby aka Salami Bing-Bing. Can you play with me forever and if you stop I'll start screaming and crying? I love to play fetch!",
        highFriendship: "Wow I need to sit down on top of your feet because we are best friends now."
    },
    sleeping: "I'll ttyl im all played out!!!"
};
