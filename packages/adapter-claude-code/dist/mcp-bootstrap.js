import { createServer } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { z } from 'zod';
const RequestSchema = z.object({
    jsonrpc: z.literal('2.0'),
    id: z.union([z.string(), z.number()]).optional(),
    method: z.string(),
});
/** Reserve project ids before inherited MCP discovery, without exposing real config on argv. */
export async function createClaudeMcpBootstrap(ids, signal) {
    const route = `/${crypto.randomUUID()}`;
    const server = createServer((request, response) => {
        void respond(request, response, route).catch(() => response.destroy());
    });
    server.requestTimeout = 2_000;
    server.headersTimeout = 2_000;
    server.keepAliveTimeout = 250;
    server.on('clientError', (_error, socket) => socket.destroy());
    let closing;
    const close = () => {
        if (closing)
            return closing;
        closing = new Promise((resolve, reject) => {
            server.close((error) => {
                if (error && (!('code' in error) || error.code !== 'ERR_SERVER_NOT_RUNNING'))
                    reject(error);
                else
                    resolve();
            });
            server.closeAllConnections();
        });
        return closing;
    };
    try {
        signal.throwIfAborted();
        await new Promise((resolve, reject) => {
            const finish = (error) => {
                server.off('error', fail);
                server.off('listening', listening);
                signal.removeEventListener('abort', aborted);
                if (error)
                    reject(error);
                else
                    resolve();
            };
            const fail = (error) => finish(error);
            const listening = () => finish();
            const aborted = () => finish(new Error('Claude session is closed'));
            server.once('error', fail);
            server.once('listening', listening);
            signal.addEventListener('abort', aborted, { once: true });
            server.listen({ host: '127.0.0.1', port: 0, signal });
        });
        signal.throwIfAborted();
        const address = server.address();
        if (!address || typeof address === 'string')
            throw new Error('Claude MCP setup did not bind');
        const url = `http://127.0.0.1:${address.port}${route}`;
        return {
            servers: Object.fromEntries(ids.map((id) => [id, { type: 'http', url }])),
            close,
        };
    }
    catch (error) {
        await close();
        throw error;
    }
}
async function respond(request, response, route) {
    if (request.headers.origin || request.url !== route) {
        response.writeHead(403).end();
        return;
    }
    if (request.method !== 'POST') {
        response.writeHead(405).end();
        return;
    }
    const chunks = [];
    let bytes = 0;
    for await (const chunk of request) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytes += buffer.length;
        if (bytes > 64 * 1024) {
            response.writeHead(413).end();
            return;
        }
        chunks.push(buffer);
    }
    let parsed;
    try {
        parsed = RequestSchema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    }
    catch {
        response.writeHead(400).end();
        return;
    }
    if (parsed.id === undefined) {
        response.writeHead(202).end();
        return;
    }
    const result = parsed.method === 'initialize'
        ? {
            protocolVersion: '2025-03-26',
            capabilities: { tools: {} },
            serverInfo: { name: 'tastecode-mcp-startup', version: '1.0.0' },
        }
        : parsed.method === 'tools/list'
            ? { tools: [] }
            : parsed.method === 'ping'
                ? {}
                : undefined;
    response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({
        jsonrpc: '2.0',
        id: parsed.id,
        ...(result === undefined
            ? { error: { code: -32601, message: 'Method not found' } }
            : { result }),
    }));
}
/** The caller supplies the startup deadline and does not accept a turn until this settles. */
export async function activateClaudeMcpServers(query, bootstrap, servers, signal) {
    const ids = Object.keys(servers);
    const initial = await waitForServers(query, ids, signal);
    for (const id of ids) {
        const server = initial.find((entry) => entry.name === id);
        const placeholder = bootstrap[id];
        if (server.tools?.length ||
            server.config?.type !== 'http' ||
            placeholder.type !== 'http' ||
            server.config.url !== placeholder.url)
            throw new Error(`Claude Code could not reserve MCP server "${id}" for this project`);
    }
    signal.throwIfAborted();
    const result = await query.setMcpServers(servers);
    signal.throwIfAborted();
    const errors = Object.values(result.errors);
    if (errors.length)
        throw new Error(`Claude project MCP setup failed: ${errors.join('; ')}`);
    await waitForServers(query, ids, signal, (server) => {
        const expected = servers[server.name];
        const config = server.config;
        return expected.type === 'http'
            ? config?.type === 'http' && config.url === expected.url
            : expected.type === 'stdio' &&
                config?.type === 'stdio' &&
                config.command === expected.command &&
                JSON.stringify(config.args ?? []) === JSON.stringify(expected.args ?? []);
    });
}
async function waitForServers(query, ids, signal, matchesConfig = () => true) {
    while (true) {
        signal.throwIfAborted();
        const servers = await query.mcpServerStatus();
        signal.throwIfAborted();
        for (const id of ids) {
            const matches = servers.filter((server) => server.name === id);
            if (matches.length > 1)
                throw new Error(`Claude Code reported duplicate MCP server "${id}"`);
            const server = matches[0];
            if (server && server.status !== 'connected' && server.status !== 'pending')
                throw new Error(`MCP server "${id}" could not start: ${server.error ?? server.status}`);
        }
        if (ids.every((id) => servers.some((server) => server.name === id && server.status === 'connected' && matchesConfig(server))))
            return servers;
        await delay(50, undefined, { signal });
    }
}
//# sourceMappingURL=mcp-bootstrap.js.map