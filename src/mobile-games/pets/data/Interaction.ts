export interface Interaction {
    id: string;
    text: string;
}

export interface Interactions {
    space: Interaction;
    pet: Interaction;
    treat: Interaction;
    play: Interaction;
    chat: Map<string, Interaction>;
}

export const frogInteractions: Interactions = {
    space: {
        id: 'G3A8-WHVN-Y0KZ-CDAY',
        text: "Yeah just like that. You can stand over there. I'll come over to you if I wanna give you a sniff. I'll be watching to see if you give me slow blinks too."
    },
    pet: {
        id: 'O3M8-BKBX-6Q1Z-FEJQ',
        text: "Ok you can pet me but I've got some rules. Not on the belly, not on the feet, not on the tail, not on my legs, hmm.. back and head are ok BUT 2 pets only, 1 is not enough, 3 is too much. Follow my rules and I won't bite you. And I know you wanna touch my toe beans, but don't even think about it!"
    },
    treat: {
        id: 'BXVZ-0DPB-IL7E-T530',
        text: "What's this? I'll give it a couple of licks, walk away, think about it for a bit, then I might come back to have more. Wait.. there isn't medicine in here is there? I'll assume no medicine. Ok I decided I want all of it! Actually, I'm bored of this treat now. Do you have anything else?"
    },
    play: {
        id: '1U74-5OLV-3T57-W4HW',
        text: "Oh gosh I love playing with crunchy toys! How about your scatter them around my palace and I'll come play with them at my leisure?"
    },
    chat: new Map([
        ['Owner', {
            id: 'YKKZ-XVMS-73CH-GRGQ',
            text: "I live with my Baba, they take good care of me. They follow all my petting rules, get me different foods all the time, and give me crunchy things. One day they brought this little human home. He smells and makes so much noise. But he makes Baba very happy, so I'll allow it."
        }],
        ['Silly', {
            id: '3Z5C-8BS9-LWQ2-4W3P',
            text: "Sometimes I get bored of my palace so I climb out of my window, disregard the fact that I live on the 7th floor, walk across a narrow railing, and hop into the neighbour's home. It's a nice change of pace, but I was told I'm not allowed to do that anymore."
        }],
        ['Dream', {
            id: 'L4JI-YXC9-FORA-37UC',
            text: "Sometimes I dream of my old mansion in Laramie, Wyoming. My kingdom was smaller back in those days. I would sit under the stairs outside my in royal gardens. The air was cool and fresh."
        }],
        ['Airplane', {
            id: 'JT2E-O40V-3M2S-8E7B',
            text: "One time I was in an airplane. It was awful. 0 out of 10, do not recommend."
        }]
    ])
};

export const ziggyInteractions: Interactions = {
    space: {
        id: 'H7RY-O6E7-WIVN-E82M',
        text: "Space is better when I don't know you very well. I like to get to know new people at my own pace! But I really like to be close to my friends."
    },
    pet: {
        id: '3RS1-USG8-SW17-MP03',
        text: "Are you my friend? You will be as soon as I figure out that you do neck scritches! Those are my favorite—just under my chin. Yep, just like that. I like belly scritches too. I'll let you know that's what I want by rolling over on my side and looking hopefully at you. "
    },
    treat: {
        id: 'TFJG-2KL6-ON5D-5LMV',
        text: "Hmm…thanks, but most treats don't do it for me. And I'm not that interested in most food. Besides, I'm not allowed to eat human food, and I'm allergic to chicken. So most dog treats make my tummy feel bad. I might sniff it a little though."
    },
    play: {
        id: 'GHLF-4MFR-VW2I-QRRX',
        text: "Playing is great! My favorite game is Hide And Go Fish. I'll tell you how to play it. First, you tell me to stay somewhere (I don't like that part but I'll do it because the next part is fun). Then you go hide my toy fish somewhere in the house. I'll listen to where you're walking, but that makes it too easy. So you should walk into more than one room. Then you come back and tell me to go get it!"
    },
    chat: new Map([
        ['My person', {
            id: 'DFW8-BWHW-9OKR-I8ZH',
            text: "My person is Felix. I was trained to be their service dog, so I'm really attached to them. I feel really sad and anxious when they're gone. But when they're around, I feel really happy! I like to follow them from room to room. And sometimes we go on adventures together!"
        }],
        ['Children', {
            id: '91GX-CQ46-ALZT-22KJ',
            text: "Oh no! You mean the little humans? They're so scary! They make loud noises and they run at me when I'm not expecting it. I get really nervous when they're close to me. But it's not my fault. I was a puppy at the beginning of Covid, so I didn't get used to being around kids."
        }],
        ['Cats', {
            id: 'HXCS-3PXB-JGJZ-363C',
            text: "The thing I like most, after my person and other dogs, is cats! I want to be every cat's friend. But they never want to be my friend. It's confusing and sad. But I'll keep trying to make them like me!"
        }],
        ['Job', {
            id: 'X0NH-0FVU-92NP-TSBE',
            text: "I used to be a service dog, and I was really serious about my job! I listened really well, and got to go all kinds of places that dogs can't usually go. I even got to ride in the cabin of an airplane across the Atlantic Ocean! I was really quiet and perfectly behaved the whole time. But being retired is nice too."
        }]
    ])
};

export const baxterInteractions: Interactions = {
    space: {
        id: '-1',
        text: 'Baxter space'
    },
    pet: {
        id: '-1',
        text: 'Baxter pet'
    },
    treat: {
        id: '-1',
        text: 'Baxter treat'
    },
    play: {
        id: '-1',
        text: 'Baxter play'
    },
    chat: new Map([
        ['Chat 1', {
            id: '-1',
            text: 'Baxter chat'
        }]
    ])
};

export const ellaInteractions: Interactions = {
    space: {
        id: '-1',
        text: 'Ella space'
    },
    pet: {
        id: '-1',
        text: 'Ella pet'
    },
    treat: {
        id: '-1',
        text: 'Ella treat'
    },
    play: {
        id: '-1',
        text: 'Ella play'
    },
    chat: new Map([
        ['Chat 1', {
            id: '-1',
            text: 'Ella chat'
        }]
    ])
};

export const doryInteractions: Interactions = {
    space: {
        id: '-1',
        text: 'Dory space'
    },
    pet: {
        id: '-1',
        text: 'Dory pet'
    },
    treat: {
        id: '-1',
        text: 'Dory treat'
    },
    play: {
        id: '-1',
        text: 'Dory play'
    },
    chat: new Map([
        ['Chat 1', {
            id: '-1',
            text: 'Dory chat'
        }]
    ])
};
