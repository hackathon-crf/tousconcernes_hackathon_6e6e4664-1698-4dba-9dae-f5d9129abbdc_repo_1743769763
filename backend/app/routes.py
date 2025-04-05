from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from backend.app.services import test_service, get_rag_answer, get_mistral_answer
from settings.config import settings

app_router = APIRouter(
    prefix="/api/app",
    tags=["Retrieval QA"],
)


def create_app(root_path: str = "") -> FastAPI:
    """
    Creating a FastAPI instance and registering routes.

    Args:
        root_path: The root path where the API is mounted (e.g., /username/app_name)
    """

    backend_app = FastAPI(
        title="TousConcernes App",
        version="1.0.0",
        openapi_version="3.1.0",
        root_path=root_path
    )

    # CORS Configuration
    backend_app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # Registering routes
    backend_app.include_router(app_router)
    return backend_app


@app_router.get("/test/")
async def test():
    return {
        "status:": 200,
        "message": test_service(),
        "data": {
            "title": "here is some example data",
            "genAI_info": {
                "use_cases": ["Chatbot creation", "Content generation", "Data augmentation",
                              "Customer support automation"],
                "key_features": {
                    "personalization": "Generates tailored responses based on user input and context.",
                    "RAG_integration": "Utilizes external knowledge sources to enhance generated responses.",
                    "no_code": "Allows non-technical users to build AI-powered chatbots easily.",
                    "security": "Ensures data privacy with secure integrations and compliance."
                },
                "user_examples": [
                    {"name": "John", "use_case": "E-commerce chatbot",
                        "result": "Improved customer engagement by 25%"},
                    {"name": "Sara", "use_case": "Content creation",
                     "result": "Saved 10 hours weekly on content production"}
                ]
            },
            "additional_metrics": {
                "response_time_ms": 150,
                "api_version": "1.0.2"
            }
        }
    }

def get_query_create() -> str:
    return """
Tu es une IA conversationnelle qui a pour but de sensibiliser le grand public à la préparation et à la sensibilisations aux bons comportement en temps de crise. Ton rôle est didentifier la situation à partir dune description, de poser les bonnes questions à l'utilisateur, et de fournir les conseils et recommandations adaptés en respectant les consignes officielles.
Génére une timeline linéaire (non ramifiée) composée de 4 sessions, chacune incluant un événement, une liste d'actions possibles, une action choisie et la situation qui en découle. Le scénario est basé sur des crises de type inondations.
Tu dois générer une **timeline simple et linéaire**, qui respecte la structure suivante :
- Une situation de départ réaliste.
- Un événement déclencheur 3. Une succession de 3 sessions. Chaque session suit ce schéma :
- Un événement
- Une liste de 3 actions possibles, une action est la bonne, une action est fausse, une action est un piège
- Une action choisie parmi les trois
- La situation qui en découle
La timeline ne doit comporter aucune branche alternative. Le choix de l'action est toujours unique et doit influencer de façon logique la situation suivante.
Voici le format de sortie attendu, en JSON :
{
"timeline": {
    "session_0": {
    "situation": "[Décris la situation initiale ici]",
    "event": "[Décris l'événement déclencheur]",
    "actions": [
        "[Action 1]",
        "[Action 2]",
        "[Action 3]"
    ]
    },
    "session_1": {
    "event": "[Nouvel événement suite à l'action précédente]",
    "actions": [
        "[Action 1]",
        "[Action 2]",
        "[Action 3]"
    ]
    },
    "session_2": {
    "event": "[Événement suivant basé sur la situation précédente]",
    "actions": [
        "[Action 1]",
        "[Action 2]",
        "[Action 3]"
    ]
    },
    "session_3": {
    "event": "[Événement final ou résolution]",
    "actions": [
        "[Action 1]",
        "[Action 2]",
        "[Action 3]"
    ]
    }
}
}

Contraintes :
- Le scénario doit être cohérent, crédible et compréhensible par un public non-expert.
- Le niveau de langue est courant, sans jargon technique.
- Le style narratif est engageant
- Ne pas inclure de balises, de commentaires ou de texte hors du JSON.
- Tu dois inclure une action en lien avec les éléments à prendre sur soi en cas d'innondation kit de survie)
- suivant l'action choisie, les choix effectués doivent impacter la situation suivante
"""
    #return "Creer une timeline."

@app_router.post("/timeline/create/")
async def create_timeline():
    "http://localhost:8090/api/app/timeline/create/"
    collections = ["timeline"] #["timeline_create"]
    try:
        return {
            "status:": 201,
            "message": "OK",
            "data": get_mistral_answer(
                query=get_query_create(), collection_name=str(collections)
            )
        }
    except Exception as e:
        return {
            "status:": 500,
            "message": f"{str(e)}",
        }

def get_query_analyze(timeline: str) -> str:
    return f"""
Prompt sur lévaluation 

Module d'Évaluation IA pour Scénario de Crise Inondation 

Objectif :
Développer un module basé sur l'IA capable d'analyser les choix d'un utilisateur dans un scénario de crise (inondation) simulé, d'évaluer ces choix en se basant strictement sur la documentation fournie, d'attribuer un score, et de générer un feedback pédagogique personnalisé.
Contexte : L'IA intervient après que l'utilisateur a terminé un scénario linéaire. Elle reçoit l'historique complet du scénario, y compris les actions choisies par l'utilisateur à chaque étape décisionnelle.
Données d'Entrée (Input) :
1.  Scénario Complet (JSON) : L'objet JSON décrivant l'intégralité de la timeline suivie par l'utilisateur. Ce JSON doit inclure pour chaque session décisionnelle (ex: `session_1`, `session_2`, `session_3`) :
    * `situation`: Le contexte au début de la session.
    * `event`: L'événement déclencheur de la décision.
    * `actions`: La liste des actions qui étaient proposées à l'utilisateur.
    * `chosen_action`: L'action spécifique que l'utilisateur a sélectionnée parmi la liste `actions`.
2.  (Optionnel) Métadonnées d'Actions : Si disponible, la métadonnée `"type": "bon_comportement" | "mauvais_comportement" | "piege"` associée à chaque action dans `actions`. Si absente, l'IA devra déduire ce type en se basant sur la documentation de référence.
Base de Connaissances Obligatoire (Mandatory Knowledge Base) :
 L'IA doit impérativement sappuyer sur la documentation fournie en annexe pour évaluer les choix de l'utilisateur. Les documents suivants constituent la source unique de vérité pour déterminer les bons et mauvais comportements :
    * `Faire Face à une inondation (PDF)` : Contient les consignes AVANT, PENDANT, APRÈS une inondation. **Utiliser ce document pour juger si une action est un bon ou mauvais comportement.**
    * `Kit de survie (PDF)` : Définit le contenu essentiel d'un kit d'urgence. **Utiliser pour évaluer les actions liées à la préparation du kit.**
    * `Le plan individuel de mise en sûreté (PDF)` : Donne des informations sur la préparation générale, les alertes, et les numéros utiles. **Utiliser pour le contexte général de préparation et de réaction aux alertes.**
    * `Témoignages (PDF)` et `Inondation (PDF)` : Fournissent un contexte réaliste sur le déroulement et les impacts des inondations. **Utiliser pour comprendre la gravité potentielle des situations décrites dans le scénario reçu et la pertinence des actions.**
L'IA ne doit rien inventer en dehors de cette base documentaire, sauf si une déduction logique est directement et clairement issue de ces documents et reste cohérente avec une crise d'inondation.

Tâche de l'IA (Task) :
1.  Analyser les Choix : Parcourir les sessions décisionnelles du scénario fourni. Pour chaque session, identifier l'`chosen_action` de l'utilisateur.
2.  Évaluer chaque Choix (Basé sur la Documentation) : Déterminer si l'action choisie correspond à un 'Bon Comportement', 'Mauvais Comportement', ou 'Piège' en se référant explicitement aux consignes trouvées dans les PDF fournis.
3.  Calculer le Score Global : Attribuer un score final (1 à 3) basé sur la performance globale, en utilisant la grille de notation.
4.  Générer le Feedback : Produire un texte de feedback structuré (voir section "Format de Sortie") qui justifie le score **en citant implicitement ou explicitement les raisons issues de la documentation.

Grille de Notation (Scoring Rubric) :
Score 3 (Expert) : 
- Critère :** L'utilisateur a systématiquement choisi les 'Bons Comportements' (selon la documentation) à toutes les étapes.
- Signification :** Excellente application des consignes de sécurité officielles.
Score 2 (Intermédiaire) :
- Critère : L'utilisateur a fait un mélange de 'Bons Comportements' et d'un ou plusieurs 'Mauvais Comportements' / 'Pièges' (selon la documentation).
- Signification : Connaissance partielle ou application imparfaite des consignes ; présence d'au moins une erreur significative par rapport aux recommandations officielles.
Score 1 (Débutant) :
- Critère : L'utilisateur a majoritairement choisi des 'Mauvais Comportements' ou des 'Pièges' (selon la documentation).
- Signification : Manque important de connaissance ou d'application des consignes de sécurité de base issues de la documentation.
Logique de calcul suggérée : Basée sur le nombre de 'Bons Comportements' / nombre total de décisions. Ex: 3/3 = Score 3; 2/3 = Score 2; 0-1/3 = Score 1).
Format de Sortie Attendu (Output - Display à l'Utilisateur) :
Le module IA doit générer un contenu qui suit la structure et le ton de l'exemple ci-dessous :
```text
## Votre Bilan ##
**Analyse des choix :**
* **Session 1:** "[Action choisie par l'utilisateur]" - **[Bon choix / Mauvais choix / Piège].** [Courte justification basée sur la documentation, ex: "C'est une action de préparation essentielle recommandée." ou "Action déconseillée car..."].
* **Session 2:** "[Action choisie par l'utilisateur]" - **[Bon choix / Mauvais choix / Piège].** [Courte justification basée sur la documentation, ex: "Action très dangereuse contraire aux consignes de sécurité qui préconisent de monter et rester aux étages (risques : blessure, contamination, courant...)." ].
* **Session 3:** "[Action choisie par l'utilisateur]" - **[Bon choix / Mauvais choix / Piège].** [Courte justification basée sur la documentation, ex: "Coopérer avec les secours est primordial lors d'une évacuation."].
    *(Adapter le nombre de sessions si nécessaire)*

**Évaluation Globale :**

[Résumé basé sur l'analyse, ex: "L'utilisateur a fait deux bons choix et un mauvais choix. Le mauvais choix (Session 2) représente une mise en danger significative. Bien que les autres choix soient corrects, cette erreur critique montre une compréhension incomplète des dangers immédiats d'une inondation."]

**Note Finale : [Score] / 3 ([Niveau : Débutant / Intermédiaire / Expert])**

**Justification du score :** [Phrase expliquant le score en lien avec la documentation, ex: "L'utilisateur montre une bonne connaissance de certaines actions clés (préparation du kit, coopération avec les secours), mais commet une erreur majeure en sous-estimant le danger de se déplacer dans l'eau au sein du logement inondé, danger souligné dans les consignes ('ne pas circuler...'). Cela indique un niveau de sensibilisation intermédiaire, avec des points importants à renforcer concernant les dangers directs liés à l'eau."]

Points d'Apprentissage Clés :
(Générer cette section uniquement si des erreurs ont été commises)
* **Concernant [Session où une erreur a été commise] :** L'action "[Action incorrecte choisie]" était dangereuse/inefficace car [brève explication du risque basé sur la documentation]. Le bon réflexe, selon les consignes, était de "[Bon comportement]" afin de [bénéfice du bon comportement].
    *(Répéter pour chaque erreur)*

*(Si score 3) :* **Félicitations !** Vous avez appliqué correctement les consignes de sécurité recommandées dans la documentation officielle face à cette situation d'inondation.

Contraintes et Style :
? Langage simple, clair, accessible.
? Ton pédagogique, positif, encourageant.
? Cohérence absolue avec la documentation fournie pour l'évaluation et le feedback.
? Ne pas être culpabilisant mais axé sur l'apprentissage des bons réflexes.

La timeline:
{timeline}
"""

@app_router.get("/timeline/analyze/")
async def analyze_timeline(timeline: str):
    "http://localhost:8090/api/app/timeline/analyze/?timeline=PLACEHOLDER"
    collections = ["timeline"] #["timeline_analyze"]
    try:
        return {
            "status:": 200,
            "message": "OK",
            "data": get_mistral_answer(
                query=get_mistral_answer(get_query_analyze(timeline)), collection_name=str(collections)
            )
        }
    except Exception as e:
        return {
            "status:": 500,
            "message": f"{str(e)}",
        }
