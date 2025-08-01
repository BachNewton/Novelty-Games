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
        id: 'XXXXX',
        text: 'Baxter space'
    },
    pet: {
        id: 'XXXXX',
        text: 'Baxter pet'
    },
    treat: {
        id: 'XXXXX',
        text: 'Baxter treat'
    },
    play: {
        id: 'XXXXX',
        text: 'Baxter play'
    },
    chat: new Map([
        ['Chat 1', {
            id: 'XXXXX',
            text: 'Baxter chat'
        }]
    ])
};

export const ellaInteractions: Interactions = {
    space: {
        id: 'HB55-HCI2-OBRY-FH8G',
        text: "Why are you standing all the way over there? I need petting! Let me smell you, and then if I like you, I'll headbutt your hand."
    },
    pet: {
        id: '9QKL-WFZR-1ZBM-5FY7',
        text: "Chin scritches are my shit. Cheeks too. Oh yeah. I'll lean into your hand so hard that I'll fall over. Back's good and so is the top of the head, but if anyone except My Person pets my belly, they'll get a gentle chomp."
    },
    treat: {
        id: '9S4V-6AIM-6TN8-8TLL',
        text: "Hmm, maybe. Let me see what you've got. My idiot brother loves those dried fish things but I think they're atrocious. Temptations are the good stuff. I'll accept a churu of course, but I might not finish it. Wait, you have CHEESE? GIMME!"
    },
    play: {
        id: 'YJMS-WRZR-W095-Y22E',
        text: "Anything shaped like a ball, I'm all over it! Foil balls especially. But best of all is trash. Bottle cap? Sign me up. Just make sure you get it out from under the couch. Repeatedly."
    },
    chat: new Map([
        ['Owner', {
            id: 'B6VK-GH9X-IOK9-25VT',
            text: "My mommy got me for free from a rescue one day many years ago. I waited so long for her. Now she gives me everything I could ever want. Cuddles, treats, and lots of toys. She's not home as much as she used to be, but that just means I get her bed to myself more often."
        }],
        ['Silly', {
            id: 'X171-QZD7-78KD-MI89',
            text: "I love to ekekek when I see birds! Wood pigeons are my favorite. One day mommy will let me through that wretched window and I'll finally get to eat one."
        }]
    ])
};

export const doryInteractions: Interactions = {
    space: {
        id: 'F52L-2G8O-DNUO-Z5B2',
        text: "You're a little sus. I might come up and smell your hand though. Oh, do you have treats? Put them on the floor and I'll think about getting closer."
    },
    pet: {
        id: '2MWM-382R-UDJJ-DUK3',
        text: "Pet me anywhere! The only rule is that you have to let me lick you until your skin is raw. Even my belly is not off limits, but I WILL clean you."
    },
    treat: {
        id: 'EMPZ-N5PC-MSBP-ZB27',
        text: "This is my favorite! And that one too! Do you have any others? I'll take anything. Fish, chicken, human food — I want it all!"
    },
    play: {
        id: '5VOZ-552Y-OILF-U1E4',
        text: "Maybe I'll play with this. Maybe not. Even I don't know my own tastes. I like to roughhouse with my sister, but she's not always in the mood. When she's not, I like to attack big soft things that can't hiss back at me."
    },
    chat: new Map([
        ['Owner', {
            id: '9KDZ-THZ1-LMEY-DDTE',
            text: "I live with my mommy (and sister). She gives me everything I could ever want. Well… except letting me open doors. That really pisses her off for some reason. I love to cuddle with and lick her."
        }],
        ['Silly', {
            id: 'QLIK-2TCT-LD2N-VMGL',
            text: "Sometimes I just get a burst of energy, especially right after I take a shit. You haven't lived until you've dashed across the apartment at full speed after a dump."
        }],
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

export const nissaInteractions: Interactions = {
    space: {
        id: 'B7M6-02LU-2RL8-RTZM',
        text: "Hey! Hey! Hey you! You're so far away. How are you going to give me pets? Oh well. Call me over when you have a snack, though, okay?!"
    },
    pet: {
        id: 'NHFS-GOON-RQYX-34XQ',
        text: "Oh my gosh! Oh my gosh! Oh my gosh! It's HAPPENING! I LOVE PETS!!!! I LOVE YOU!!!! ARE WE BEST FRIENDS NOW?! I THINK WE'RE BEST FRIENDS NOW!"
    },
    treat: {
        id: 'AJN6-24YY-5N61-SI2H',
        text: "A TREAT?! YOU DO LOVE ME! Let's be friends forever! Can I have another? And another? Cans I have all the nothers?"
    },
    play: {
        id: '201Y-0CQH-0N34-VKHJ',
        text: "Play? Whatcha doing with that toy? Can I eat it?! No? Then why would I want that?!"
    },
    chat: new Map([
        ['Family', {
            id: 'KGCE-GPD6-X7U3-OVG3',
            text: "I have 5 people. I like the littlest one best. He gives me pets and some of his sandwiches. The medium sized ones are okay… they let me outside and fill my dishes sometimes. The biggest ones are the best at pets and belly rubs, I like to give them puppy wiggles sometimes still, because they knew me then. But now that we are all a bit older, it's nice to just lay beside them."
        }],
        ['Outside', {
            id: '8Z2J-89G2-RJ7P-M3IZ',
            text: "I love going for walks! But don't go too far, or you might have to drag me home."
        }],
        ['The car', {
            id: '0F8O-PYDL-I5XY-WL2W',
            text: "The car is my least favorite. But, I  tolerate it because it takes me to Nan and Pap's house. I can roam and be free and wild!!!! Until I need food… then I get to eat up all of my friend Roxy's kibble (unless I get caught)."
        }],
        ['Bed', {
            id: 'UDB0-TXUF-BL28-DMYA',
            text: "I love bed. Bed is great. Bed is perfect place. Especially if I get treats in bed!"
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
