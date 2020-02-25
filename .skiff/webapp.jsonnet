/**
 * This is a template that's compiled down to a definition of the
 * infrastructural resources required for running your application.
 *
 * For more information on the JSONNET language, see:
 * https://jsonnet.org/learning/getting_started.html
 */

// This file is generated once at template creation time and unlikely to change
// from that point forward.
local config = import '../skiff.json';

function(
    uiImage, apiImage, proxyImage, cause, sha, env='staging', branch='', repo='',
    buildId=''
)
    // We only allow registration of hostnames attached to '*.apps.allenai.org'
    // at this point. If you need a custom domain, contact us: reviz@allenai.org.
    local topLevelDomain = '.apps.allenai.org';
    local hosts =
        if env == 'prod' then
            [ 'supp.ai', 'www.supp.ai', 'supplement-interactions.info', 'www.supplement-interactions.info', 'smartsupp.ai', 'www.smartsupp.ai', 'smartsupp.info', 'www.smartsupp.info', config.appName + topLevelDomain ]
        else
            [ config.appName + '.' + env + topLevelDomain ];

    // In production we run two versions of your application, as to ensure that
    // if one instance goes down or is busy, end users can still use the application.
    // In all other environments we run a single instance to save money.
    local replicas = (
        if env == 'prod' then
            3
        else
            1
    );

    // Each app gets it's own namespace.
    local namespaceName = config.appName;

    // Since we deploy resources for different environments in the same namespace,
    // we need to give things a fully qualified name that includes the environment
    // as to avoid unintentional collission / redefinition.
    local fullyQualifiedName = config.appName + '-' + env;

    // Every resource is tagged with the same set of labels. These labels serve the
    // following purposes:
    //  - They make it easier to query the resources, i.e.
    //      kubectl get pod -l app=my-app,env=staging
    //  - The service definition uses them to find the pods it directs traffic to.
    local namespaceLabels = {
        app: config.appName,
        contact: config.contact,
        team: config.team
    };

    local labels = namespaceLabels + {
        env: env
    };

    // Annotations carry additional information about your deployment that
    // we use for auditing, debugging and administrative purposes
    local annotations = {
        "apps.allenai.org/sha": sha,
        "apps.allenai.org/branch": branch,
        "apps.allenai.org/repo": repo,
        "apps.allenai.org/build": buildId
    };

    // The port the NGINX proxy is bound to.
    local proxyPort = 80;

    // The port the API (Python Flask application) is bound to.
    local apiPort = 8000;

    // The port the UI (NextJS application) is bound to
    local uiPort = 3000;

    // This is used to verify that the proxy (and thereby the UI portion of the
    // application) is healthy. If this fails the application won't receive traffic,
    // and may be restarted.
    local proxyHealthCheck = {
        port: proxyPort,
        scheme: 'HTTP'
    };

    // This is used to verify that the API is funtional. We simply check for
    // whether the socket is open and available.
    local apiHealthCheck = {
        initialDelaySeconds: 30,  // Use a longer delay if your app loads a large model.
        tcpSocket: {
            port: apiPort
        }
    };

    local uiHealthCheck = apiHealthCheck + {
        tcpSocket: {
            port: uiPort
        }
    };

    local namespace = {
        apiVersion: 'v1',
        kind: 'Namespace',
        metadata: {
            name: namespaceName,
            labels: namespaceLabels
        }
    };

    local ingress = {
        apiVersion: 'extensions/v1beta1',
        kind: 'Ingress',
        metadata: {
            name: fullyQualifiedName,
            namespace: namespaceName,
            labels: labels,
            annotations: annotations + {
                'certmanager.k8s.io/cluster-issuer': 'letsencrypt-prod',
                'kubernetes.io/ingress.class': 'nginx',
                'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
                'nginx.ingress.kubernetes.io/enable-cors': 'false'
            }
        },
        spec: {
            tls: [
                {
                    secretName: fullyQualifiedName + '-tls',
                    hosts: hosts
                }
            ],
            rules: [
                {
                    host: host,
                    http: {
                        paths: [
                            {
                                backend: {
                                    serviceName: fullyQualifiedName,
                                    servicePort: proxyPort
                                }
                            }
                        ]
                    }
                } for host in hosts
            ]
        }
    };

    local deployment = {
        apiVersion: 'extensions/v1beta1',
        kind: 'Deployment',
        metadata: {
            labels: labels,
            name: fullyQualifiedName,
            namespace: namespaceName,
            annotations: annotations + {
                'kubernetes.io/change-cause': cause
            }
        },
        spec: {
            revisionHistoryLimit: 3,
            replicas: replicas,
            template: {
                metadata: {
                    name: fullyQualifiedName,
                    namespace: namespaceName,
                    labels: labels,
                    annotations: annotations
                },
                spec: {
                    containers: [
                        {
                            name: fullyQualifiedName + '-ui',
                            image: uiImage,
                            readinessProbe: uiHealthCheck,
                            livenessProbe: uiHealthCheck,
                            env: [
                                {
                                    name: 'NODE_ENV',
                                    value: 'production'
                                },
                                {
                                    name: 'SUPP_AI_API_ORIGIN',
                                    value: 'http://localhost:' + proxyPort
                                },
                                {
                                    name: 'SUPP_AI_CANONICAL_ORIGIN',
                                    value: 'https://' + hosts[0],
                                }
                            ],
                            resources: {
                                requests: {
                                    cpu: '0.3',
                                    memory: '1Gi'
                                }
                            }
                        },
                        {
                            name: fullyQualifiedName + '-api',
                            image: apiImage,
                            args: [ 'app/start.py', '--prod' ],
                            readinessProbe: apiHealthCheck,
                            livenessProbe: apiHealthCheck,
                            resources: {
                                requests: {
                                    cpu: '0.3',
                                    memory: '2Gi'
                                }
                            },
                            env: [
                                {
                                    name: 'SUPP_AI_ALGOLIA_API_KEY',
                                    valueFrom: {
                                        secretKeyRef: {
                                            name: 'algolia-key',
                                            key: 'value'
                                        }
                                    }
                                },
                                {
                                    name: 'SUPP_AI_CANONICAL_ORIGIN',
                                    value: 'https://' + hosts[0],
                                }
                            ]
                        },
                        {
                            name: fullyQualifiedName + '-proxy',
                            image: proxyImage,
                            readinessProbe: {
                                httpGet: proxyHealthCheck + {
                                    path: '/?check=rdy'
                                }
                            },
                            livenessProbe: {
                                failureThreshold: 6,
                                httpGet: proxyHealthCheck + {
                                    path: '/?check=live'
                                }
                            },
                            resources: {
                                requests: {
                                   cpu: '0.2',
                                   memory: '500Mi'
                                }
                            }
                        }
                    ]
                }
            }
        }
    };

    local service = {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: fullyQualifiedName,
            namespace: namespaceName,
            labels: labels,
            annotations: annotations
        },
        spec: {
            selector: labels,
            ports: [
                {
                    port: proxyPort,
                    name: 'http'
                }
            ]
        }
    };

    [
        namespace,
        ingress,
        deployment,
        service
    ]
