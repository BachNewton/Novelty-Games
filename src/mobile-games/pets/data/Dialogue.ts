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
    hidden: "This place looks strange, but there are lots of new people to get pets from! Don't you want to join them? Come find me!",
    greeting: {
        lowFriendship: "Hi, my name is Ella. I'm curious about you! I bet we'll be friends in no time.",
        highFriendship: "It's so nice to sit three feet away from you. I like being around you, just close enough for you to pet me but not quite touching you. I might seem quiet, but if you put your finger on my throat, you'll feel my soft purr."
    },
    sleeping: "Not now. I need my beauty sleep."
};

export const doryDialog: Dialogue = {
    hidden: "Where am I?! This isn't home! None of my stuff is here. Come find me and take me back to my safe place.",
    greeting: {
        lowFriendship: "My name is Dorian, but everyone calls me Dory. Or asshole when I've done something naughty. I'm a little wary of you because I don't know you yet, but if you give me treats I'll quickly become your best friend.",
        highFriendship: "I'm going to sit on you. That's not a request, it's an order. I have to be touching you at all times, or at least no farther away than 2 feet. I'll purr at you for hours, so loud you can hear it from across the room — if I let you get that far."
    },
    sleeping: "Hmph. Come back if you've got food."
};

export const albyDialog: Dialogue = {
    hidden: "I'm gonna start howling like Baltimore any minute now!",
    greeting: {
        lowFriendship: "Hi, I'm Alby aka Salami Bing-Bing. Can you play with me forever and if you stop I'll start screaming and crying? I love to play fetch!",
        highFriendship: "Wow I need to sit down on top of your feet because we are best friends now."
    },
    sleeping: "I'll ttyl im all played out!!!"
};

export const lenoreDialog: Dialogue = {
    hidden: "Hmm, I don't know about Helsinki. But maybe you can find me \"lion\" around...",
    greeting: {
        lowFriendship: "I am Lenore. You can buy my attention with treats. My affection is not for sale, but if you're quiet and give high quality chin scritches I'll consider throwing a purr your way.",
        highFriendship: "Hmm, yes, your lap is warm. Let's sit here for eternity. No, you don't need to pee or eat."
    },
    sleeping: "No thanks. Come back later. Wait, do you have treats?? No? Definitely come back later."
};

export const nissaDialog: Dialogue = {
    hidden: "I love meeting new people who will give me treats and belly scratches, they don't seem to want me to keep jumping up on them, though. But how else will they know that I want the rest of their korvapuusti?",
    greeting: {
        lowFriendship: "Hi! Hello! Hi! Hi! Hi! Hi! My name is Nissa! Did you come to give me a scratch? Or a treat? OR BOTH?! Be careful though, if I get too excited I might jump up on you, or rollover onto my back and pee on myself. Which for some reason makes people want to pet my belly less… I don't get it.",
        highFriendship: "Thanks for not getting too upset when I jumped up. Sometimes I just need some patience so I can calm down and enjoy some love and pets… now that we are friends, it's nice to just sit nearby and enjoy your company… and whatever food you leave unattended."
    },
    sleeping: "Sorry, can't move. Too comfy. My legs won't work until I hear my food dish filled."
};

export const templateDialog: Dialogue = {
    hidden: "XXXXX",
    greeting: {
        lowFriendship: "XXXXX",
        highFriendship: "XXXXX"
    },
    sleeping: "XXXXX"
};
