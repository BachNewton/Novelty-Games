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

export const albyInteractions: Interactions = {
    space: {
        id: '5K6V-VI93-KI9N-N9JH',
        text: "I'd rather not have space how about we go outside??"
    },
    pet: {
        id: 'LCQL-7R69-BUP6-YPAC',
        text: "Keep it comin'"
    },
    treat: {
        id: 'TENO-BT21-7P8W-H3S6',
        text: "That is pretty delicious I'd like 50 more"
    },
    play: {
        id: 'SIK4-8YXT-ONH6-61T4',
        text: "RAWRRRRRR I love to yell when I'm playing but I'm not actually scary lol"
    },
    chat: new Map([
        ['Sister', {
            id: 'RDL7-WK1O-YHCX-BMNV',
            text: "My sister is pretty cranky. Is it because she's an old lady?"
        }]
    ])
};

export const lenoreInteractions: Interactions = {
    space: {
        id: '042R-40ME-E61P-P0AL',
        text: "You have not been dismissed. I will inform you when you are allowed to go. Oh, now you're staying? Yeah, you can go."
    },
    pet: {
        id: 'RMWS-76KP-3ZRV-P5E0',
        text: "I enjoy scritches on my neck and under my chin, but let me take the lead. I'll move around your hand so you're in the right spot. If you really hit it I might even kick my foot a little."
    },
    treat: {
        id: 'Z1MH-0CEU-IWEC-NDJ2',
        text: "HIGH-FIVE"
    },
    play: {
        id: 'HZUN-V0WU-KPCK-TPQC',
        text: "Pounce! Claw!! Attack!!! Yes good, now you keep going for 20 minutes while I lay under this chair and just watch. That's the stuff."
    },
    chat: new Map([
        ['New Digs', {
            id: 'IRZP-0FMB-AQHL-0J49',
            text: "I like my new apartment okay. I watch birds and squirrels eat on the patio. The best part is NO Ziggies allowed 😻"
        }],
        ['My Human', {
            id: 'V6G5-T00L-TJ98-PWWY',
            text: "My person doesn't understand that her sole purpose is to be warm and rub my belly. We've been doing this for over a decade. Why is she so hard to educate!! 😾"
        }],
        ['Reminisce', {
            id: '5Y6Q-XIGT-TZEV-GKL6',
            text: "When I first met my person we lived in a big house and I was queen of my neighborhood. I'd fight anyone who looked at me wrong and end up at the vet. Sometimes I would disappear to the elementary school across the street much to my human's distress. I miss having a yard 😿"
        }],
        ['Gotcha', {
            id: 'LJEF-RTVW-QPEI-2IYS',
            text: "I saw you move your hand!! I have run across the room to high-five you!! You now owe me treats. It is a blood contract that you have no way out of 😼"
        }],
        ['Scream', {
            id: '2NQN-O3AA-VNOT-Y0N5',
            text: "MEOW- What do I want? MEOW- Haha, I'll never tell!! But you better figure it out if you want to sleep tonight MEEEeeEeooOOoowwwww 😹"
        }],
        ['Request Paw', {
            id: 'OS74-VFIZ-7N28-IWI5',
            text: "If you are truly blessed I may bounce my request paw at you and allow you to rub my belly. No one has ever dared to ignore the request paw. Will you be the first? 🙀"
        }]
    ])
};

export const templateInteractions: Interactions = {
    space: {
        id: 'XXXXX',
        text: "XXXXX"
    },
    pet: {
        id: 'XXXXX',
        text: "XXXXX"
    },
    treat: {
        id: 'XXXXX',
        text: "XXXXX"
    },
    play: {
        id: 'XXXXX',
        text: "XXXXX"
    },
    chat: new Map([
        ['XXXXX', {
            id: 'XXXXX',
            text: "XXXXX"
        }]
    ])
};
